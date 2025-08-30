// Helper to convert 0-256 RGB to 0-1 RGBA
function rgb256(r, g, b, a = 1) {
  return [r / 256, g / 256, b / 256, a];
}
//////////////////////////////////////////////////////////////////////////////////
//  CS360 Assignment 1 - 2D Scene Rendering
//
//

var gl;
var canvas;
var shaderProgram;
var aPositionLocation;
var uMMatrixLocation;
var uColorLocation;
var uPointSizeLocation;
var moonRotation = 0.0; // current rotation angle (radians)
var moonSpeedDeg = 12.0; // degrees per second
var twinkle = 0.0;
var twinkleDir = 1;
var twinkleSpeed = 0.8;
const MIN_TWINKLE = 0.5;
const MAX_TWINKLE = 1.0;
var starCount = 5;
var starTime = 0.0;
var windRotation = 0.0;
var windSpeedDeg = 180.0; // degrees per second for fan
// Boat state
var boat1X = 0.4; // current x offset of the boat (world coords)
var boat1Dir = 1; // 1 = moving right, -1 = moving left
var boat1Speed = 0.15; // world units per second
var boat1MinX = -0.8;
var boat1MaxX = 0.8;
var boat1Y = -0.2; // vertical position for the boat on the river

var boat2X = 0.0; // current x offset of the boat (world coords)
var boat2Dir = 1; // 1 = moving right, -1 = moving left
var boat2Speed = 0.15; // world units per second
var boat2MinX = -0.8;
var boat2MaxX = 0.8;
var boat2Y = -0.15; // vertical position for the boat on the river

// Buffers for primitives
var sqVertexPositionBuffer;
var sqVertexIndexBuffer;
var circleVertexPositionBuffer;
var circleVertexIndexBuffer;
var triVertexPositionBuffer;
var triVertexIndexBuffer;

// Matrix operations
var model = mat4.create();

// Rendering mode control
var currentRenderMode; // Will be set after WebGL context is created

const vertexShaderCode = `#version 300 es
in vec2 aPosition;
uniform mat4 uMMatrix;
uniform float uPointSize;

void main() {
  gl_Position = uMMatrix*vec4(aPosition,0.0,1.0);
  gl_PointSize = uPointSize;
}`;

const fragShaderCode = `#version 300 es
precision mediump float;
out vec4 fragColor;
uniform vec4 uColor;

void main() {
  fragColor = uColor;
}`;

function vertexShaderSetup(vertexShaderCode) {
  shader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(shader, vertexShaderCode);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert(gl.getShaderInfoLog(shader));
    return null;
  }
  return shader;
}

function fragmentShaderSetup(fragShaderCode) {
  shader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(shader, fragShaderCode);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert(gl.getShaderInfoLog(shader));
    return null;
  }
  return shader;
}

function initShaders() {
  shaderProgram = gl.createProgram();

  var vertexShader = vertexShaderSetup(vertexShaderCode);
  var fragmentShader = fragmentShaderSetup(fragShaderCode);

  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    console.log(gl.getShaderInfoLog(vertexShader));
    console.log(gl.getShaderInfoLog(fragmentShader));
  }

  gl.useProgram(shaderProgram);
  return shaderProgram;
}

function initGL(canvas) {
  try {
    gl = canvas.getContext("webgl2");
    gl.viewportWidth = canvas.width;
    gl.viewportHeight = canvas.height;
  } catch (e) {}
  if (!gl) {
    alert("WebGL initialization failed");
  }
}

function degToRad(degrees) {
  return (degrees * Math.PI) / 180;
}

// Square primitive setup
function initSquareBuffer() {
  const sqVertices = new Float32Array([
    0.5, 0.5, -0.5, 0.5, -0.5, -0.5, 0.5, -0.5,
  ]);
  sqVertexPositionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, sqVertexPositionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, sqVertices, gl.STATIC_DRAW);
  sqVertexPositionBuffer.itemSize = 2;
  sqVertexPositionBuffer.numItems = 4;

  const sqIndices = new Uint16Array([0, 1, 2, 0, 2, 3]);
  sqVertexIndexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sqVertexIndexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, sqIndices, gl.STATIC_DRAW);
  sqVertexIndexBuffer.itemSize = 1;
  sqVertexIndexBuffer.numItems = 6;
}

// Circle primitive setup (triangle fan approach)
function initCircleBuffer() {
  const numSegments = 32; // Number of triangular segments for smooth circle
  const vertices = [];
  const indices = [];

  // Center vertex at origin
  vertices.push(0.0, 0.0);

  // Generate vertices around the circle
  for (let i = 0; i <= numSegments; i++) {
    const angle = (i * 2.0 * Math.PI) / numSegments;
    const x = Math.cos(angle);
    const y = Math.sin(angle);
    vertices.push(x, y);
  }

  // Generate triangle fan indices
  for (let i = 1; i <= numSegments; i++) {
    indices.push(0); // Center vertex
    indices.push(i); // Current vertex
    indices.push(i + 1); // Next vertex
  }

  // Create vertex buffer
  circleVertexPositionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, circleVertexPositionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
  circleVertexPositionBuffer.itemSize = 2;
  circleVertexPositionBuffer.numItems = vertices.length / 2;

  // Create index buffer
  circleVertexIndexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, circleVertexIndexBuffer);
  gl.bufferData(
    gl.ELEMENT_ARRAY_BUFFER,
    new Uint16Array(indices),
    gl.STATIC_DRAW
  );
  circleVertexIndexBuffer.itemSize = 1;
  circleVertexIndexBuffer.numItems = indices.length;
}

// Triangle primitive setup
function initTriangleBuffer() {
  const triVertices = new Float32Array([
    0.0,
    0.5, // Top vertex
    -0.5,
    -0.5, // Bottom left vertex
    0.5,
    -0.5, // Bottom right vertex
  ]);
  triVertexPositionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, triVertexPositionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, triVertices, gl.STATIC_DRAW);
  triVertexPositionBuffer.itemSize = 2;
  triVertexPositionBuffer.numItems = 3;

  const triIndices = new Uint16Array([0, 1, 2]);
  triVertexIndexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, triVertexIndexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, triIndices, gl.STATIC_DRAW);
  triVertexIndexBuffer.itemSize = 1;
  triVertexIndexBuffer.numItems = 3;
}

function drawSquare(mMatrix, color) {
  gl.uniformMatrix4fv(uMMatrixLocation, false, mMatrix);

  // Bind square vertex buffer
  gl.bindBuffer(gl.ARRAY_BUFFER, sqVertexPositionBuffer);
  gl.vertexAttribPointer(
    aPositionLocation,
    sqVertexPositionBuffer.itemSize,
    gl.FLOAT,
    false,
    0,
    0
  );

  // Bind square index buffer
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sqVertexIndexBuffer);

  gl.uniform4fv(uColorLocation, color);

  // Use current rendering mode
  if (currentRenderMode === gl.POINTS) {
    gl.drawArrays(gl.POINTS, 0, sqVertexPositionBuffer.numItems);
  } else if (currentRenderMode === gl.LINE_LOOP) {
    gl.drawArrays(gl.LINE_LOOP, 0, sqVertexPositionBuffer.numItems);
  } else {
    gl.drawElements(
      gl.TRIANGLES,
      sqVertexIndexBuffer.numItems,
      gl.UNSIGNED_SHORT,
      0
    );
  }
}

function drawCircle(mMatrix, color) {
  gl.uniformMatrix4fv(uMMatrixLocation, false, mMatrix);

  // Bind circle vertex buffer
  gl.bindBuffer(gl.ARRAY_BUFFER, circleVertexPositionBuffer);
  gl.vertexAttribPointer(
    aPositionLocation,
    circleVertexPositionBuffer.itemSize,
    gl.FLOAT,
    false,
    0,
    0
  );

  // Bind circle index buffer
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, circleVertexIndexBuffer);

  gl.uniform4fv(uColorLocation, color);

  // Use current rendering mode
  if (currentRenderMode === gl.POINTS) {
    gl.drawArrays(gl.POINTS, 0, circleVertexPositionBuffer.numItems);
  } else if (currentRenderMode === gl.LINE_LOOP) {
    // For wireframe, draw just the outer edge (skip center vertex)
    gl.drawArrays(gl.LINE_LOOP, 1, circleVertexPositionBuffer.numItems - 1);
  } else {
    gl.drawElements(
      gl.TRIANGLES,
      circleVertexIndexBuffer.numItems,
      gl.UNSIGNED_SHORT,
      0
    );
  }
}

function drawTriangle(mMatrix, color) {
  gl.uniformMatrix4fv(uMMatrixLocation, false, mMatrix);

  // Bind triangle vertex buffer
  gl.bindBuffer(gl.ARRAY_BUFFER, triVertexPositionBuffer);
  gl.vertexAttribPointer(
    aPositionLocation,
    triVertexPositionBuffer.itemSize,
    gl.FLOAT,
    false,
    0,
    0
  );

  // Bind triangle index buffer
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, triVertexIndexBuffer);

  gl.uniform4fv(uColorLocation, color);

  // Use current rendering mode
  if (currentRenderMode === gl.POINTS) {
    gl.drawArrays(gl.POINTS, 0, triVertexPositionBuffer.numItems);
  } else if (currentRenderMode === gl.LINE_LOOP) {
    gl.drawArrays(gl.LINE_LOOP, 0, triVertexPositionBuffer.numItems);
  } else {
    gl.drawElements(
      gl.TRIANGLES,
      triVertexIndexBuffer.numItems,
      gl.UNSIGNED_SHORT,
      0
    );
  }
}

//////////////////////////////////////////////////////////////////////////////////
// Main Code
//////////////////////////////////////////////////////////////////////////////////

//// Sky Part

function drawCircleAt(mMatrix, cx, cy, r, color) {
  let localMatrix = mat4.create(mMatrix);
  localMatrix = mat4.translate(localMatrix, [cx, cy, 0]);
  localMatrix = mat4.scale(localMatrix, [r, r * 0.6, 1]);
  drawCircle(localMatrix, color);
}

function drawCloud(mMatrix, x = 0, y = 0, size) {
  const r1 = size;
  const r2 = size * 0.8;
  const r3 = size * 0.6;

  // Place first cloud at x
  const c1 = x;
  // Second cloud
  const c2 = c1 + (r1 + r2) * 0.6;
  // Third cloud
  const c3 = c2 + (r2 + r3) * 0.8;

  drawCircleAt(mMatrix, c1, y, r1, rgb256(178, 178, 178, 1));
  drawCircleAt(mMatrix, c2, y - (r1 - r2) * 0.6, r2, rgb256(255, 255, 255, 1));
  drawCircleAt(mMatrix, c3, y - (r1 - r2) * 0.6, r3, rgb256(178, 178, 178, 1));
}

function drawSky() {
  let skyMatrix = mat4.create(model);
  skyMatrix = mat4.translate(skyMatrix, [0.0, 0.6, 0.0]);
  drawCloud(skyMatrix, -0.85, -0.05, 0.2);
  // Moon (rotating)
  drawMoon(skyMatrix, -0.7, 0.2, 0.1, moonRotation);

  drawStars();
}

function drawStars() {
  stars = [
    { x: -0.15, y: 0.5, size: 0.01 },
    { x: -0.1, y: 0.6, size: 0.02 },
    { x: -0.25, y: 0.7, size: 0.02 },
    { x: 0.45, y: 0.7, size: 0.03 },
    { x: 0.65, y: 0.9, size: 0.01 },
  ];

  // draw each star as a point with alpha varying sinusoidally
  if (!stars || stars.length === 0) return;
  for (const s of stars) {
    drawStarAt(s.x, s.y, s.size);
  }
}

// Draw a single star at (x,y) with size (pixels) and twinkle alpha
function drawStarAt(x, y, size) {
  // twinkle controls scale (shrink/expand)
  const starColor = [1.0, 1.0, 1, 1.0];
  // Map incoming 'size' (previously in px) to a world scale
  const animScale = size * twinkle * 0.5;

  // central square
  let sq = mat4.create(model);
  sq = mat4.translate(sq, [x, y, 0]);
  sq = mat4.scale(sq, [animScale, animScale, 1]);
  drawSquare(sq, starColor);

  // triangles around (top, right, bottom, left)
  const triScale = animScale * 3;
  let x_offset = 0.0;
  let y_offset = 0.5 * animScale + 0.5 * triScale; // move so triangles sit on square edges

  // top
  let t = mat4.create(model);
  t = mat4.translate(t, [x + x_offset, y + y_offset, 0]);
  t = mat4.scale(t, [animScale, triScale, 1]);
  drawTriangle(t, starColor);

  // right
  x_offset = 0.5 * animScale + 0.5 * triScale; // move so triangles sit on square edges
  y_offset = 0.0;
  let tr = mat4.create(model);
  tr = mat4.translate(tr, [x + x_offset, y + y_offset, 0]);
  tr = mat4.rotate(tr, degToRad(-90), [0, 0, 1]);
  tr = mat4.scale(tr, [animScale, triScale, 1]);
  drawTriangle(tr, starColor);

  // bottom
  x_offset = 0.0;
  y_offset = -(0.5 * animScale + 0.5 * triScale); // move so triangles sit on square edges
  let tb = mat4.create(model);
  tb = mat4.translate(tb, [x + x_offset, y + y_offset, 0]);
  tb = mat4.rotate(tb, degToRad(180), [0, 0, 1]);
  tb = mat4.scale(tb, [animScale, triScale, 1]);
  drawTriangle(tb, starColor);

  // left
  x_offset = -(0.5 * animScale + 0.5 * triScale); // move so triangles sit on square edges
  y_offset = 0.0;
  let tl = mat4.create(model);
  tl = mat4.translate(tl, [x + x_offset, y + y_offset, 0]);
  tl = mat4.rotate(tl, degToRad(90), [0, 0, 1]);
  tl = mat4.scale(tl, [animScale, triScale, 1]);
  drawTriangle(tl, starColor);
}

// Draw a moon with rectangular spikes and rotate the spikes around the moon center
function drawMoon(mMatrix, cx, cy, radius, rotation) {
  // Base moon circle
  let moonMat = mat4.create(mMatrix);
  moonMat = mat4.translate(moonMat, [cx, cy, 0]);
  moonMat = mat4.scale(moonMat, [radius, radius, 1]);
  drawCircle(moonMat, rgb256(255, 250, 255));

  // Spikes: draw several small rectangles around the circle, rotated by 'rotation'
  const spikeCount = 8;
  const spikeWidth = 0.005;
  const spikeHeight = 0.04;
  for (let i = 0; i < spikeCount; i++) {
    const ang = (i * (2 * Math.PI)) / spikeCount + rotation;
    // place spike at the rim
    let spike = mat4.create(mMatrix);
    // translate to moon center
    spike = mat4.translate(spike, [cx, cy, 0]);
    // rotate about center
    spike = mat4.rotate(spike, ang, [0, 0, 1]);
    // move outward along rotated X axis by (radius + spikeHeight/2)
    spike = mat4.translate(spike, [radius + spikeHeight / 2, 0, 0]);
    // scale to rectangle spike
    spike = mat4.scale(spike, [spikeHeight, spikeWidth, 1]);
    drawSquare(spike, rgb256(255, 255, 255));
  }
}

//// Sky Part Ended

//// Mountain Land Part
// Draw a single mountain given its base
function drawMountain(mMatrix, x, baseY, width, height, color) {
  let local = mat4.create(mMatrix);
  local = mat4.translate(local, [x, baseY + 0.5 * height, 0]);
  local = mat4.scale(local, [width, height, 1]);
  drawTriangle(local, color);
}

// Draw a mountain with a shadow/highlight overlay triangle rotated about the top vertex.
function drawShadowedMountain(
  mMatrix,
  x,
  baseY,
  width,
  height,
  colorMain,
  colorOverlay,
  angle = degToRad(-12)
) {
  // Base mountain
  drawMountain(mMatrix, x, baseY, width, height, colorMain);

  // Rebuild the same base transform for overlay
  let overlay = mat4.create(mMatrix);
  overlay = mat4.translate(overlay, [x, baseY + 0.5 * height, 0]);
  overlay = mat4.scale(overlay, [width, height, 1]);
  // Pivot around top vertex (0, 0.5) in unit triangle space
  overlay = mat4.translate(overlay, [0, 0.5, 0]);
  overlay = mat4.rotate(overlay, angle, [0, 0, 1]);
  overlay = mat4.translate(overlay, [0, -0.5, 0]);
  drawTriangle(overlay, colorOverlay);
}

// Draw overlapping mountains sharing a common base line.
function drawMountains(mMatrix) {
  const baseY = -0.1; // common base line (adjust as needed)
  let w1 = 0.9;
  let w2 = 1.2;
  let w3 = 0.7;
  const mountains = [
    {
      x: -0.7,
      w: w1,
      h: w1 * 0.3,
      c_overlay: rgb256(150, 120, 82),
      c_base: rgb256(128, 93, 66, 1),
      angle: degToRad(8),
    },
    {
      x: 0.1,
      w: w2,
      h: w2 * 0.3,
      c_overlay: rgb256(150, 120, 82),
      c_base: rgb256(128, 100, 66, 1),
      angle: degToRad(8),
    },
    {
      x: 0.9,
      w: w3,
      h: w3 * 0.3,
      c_overlay: rgb256(150, 120, 82),
      c_base: rgb256(128, 100, 66, 1),
      angle: degToRad(0),
    },
  ];
  // Back-to-front: earlier ones drawn first
  for (const m of mountains) {
    drawShadowedMountain(
      mMatrix,
      m.x,
      baseY,
      m.w,
      m.h,
      m.c_base,
      m.c_overlay,
      m.angle
    );
  }
}

// Draw tree top foliage layers whose
function drawTreeTop(mMatrix, x, centerY, scale) {
  const layers = 3;
  const scaleFactor = 1.1;
  const diff = scale * 0.06;
  const color1 = rgb256(0, 153, 77);
  const color2 = rgb256(78, 178, 78);
  const color3 = rgb256(101, 204, 77);

  let layerBaseWidth = scale * 0.4;
  let layerHeight = scale * 0.3;
  let newY = centerY + layerHeight / 2;
  let layerMat1 = mat4.create(mMatrix);
  layerMat1 = mat4.translate(layerMat1, [x, newY, 0]);
  layerMat1 = mat4.scale(layerMat1, [layerBaseWidth, layerHeight, 1]);
  drawTriangle(layerMat1, color1);

  layerBaseWidth = layerBaseWidth * scaleFactor;
  layerHeight = layerHeight * scaleFactor;
  newY = newY + diff;
  let layerMat2 = mat4.create(mMatrix);
  layerMat2 = mat4.translate(layerMat2, [x, newY, 0]);
  layerMat2 = mat4.scale(layerMat2, [layerBaseWidth, layerHeight, 1]);
  drawTriangle(layerMat2, color2);

  layerBaseWidth = layerBaseWidth * scaleFactor;
  layerHeight = layerHeight * scaleFactor;
  newY = newY + diff;
  let layerMat3 = mat4.create(mMatrix);
  layerMat3 = mat4.translate(layerMat3, [x, newY, 0]);
  layerMat3 = mat4.scale(layerMat3, [layerBaseWidth, layerHeight, 1]);
  drawTriangle(layerMat3, color3);
}

function drawTree(mMatrix, x, baseY, scale) {
  const trunkColor = rgb256(128, 77, 77);
  const trunkHeight = 0.35 * scale;
  const trunkWidth = 0.05 * scale;
  console.log("scale:", scale);

  let trunk = mat4.create(mMatrix);
  trunk = mat4.translate(trunk, [x, baseY + trunkHeight / 2, 0]);
  trunk = mat4.scale(trunk, [trunkWidth, trunkHeight, 1]);
  drawSquare(trunk, trunkColor);

  const centerY = baseY + trunkHeight;
  drawTreeTop(mMatrix, x, centerY, scale);
}

function drawMountainLand() {
  drawMountains(model);

  // draw green land
  let land = mat4.create(model);
  land = mat4.translate(land, [0.0, -0.6, 0.0]);
  land = mat4.scale(land, [2, 1, 1.0]);
  drawSquare(land, rgb256(0, 229, 128));

  const treeBaseY = -0.11;
  drawTree(model, 0.8, treeBaseY, 0.8);
  drawTree(model, 0.6, treeBaseY, 0.9);
  drawTree(model, 0.4, treeBaseY, 0.7);
}

//// Mountain Land Ended

//// River

function drawRiverLines(x, y) {
  const lineColor = rgb256(255, 255, 255);
  const lineWidth = 0.0021;
  const lineLength = 0.4;

  let line = mat4.create(model);
  line = mat4.translate(line, [x, y, 0.0]);
  line = mat4.scale(line, [lineLength, lineWidth, 1.0]);
  drawSquare(line, lineColor);
}

function drawRiver() {
  let river = mat4.create(model);
  river = mat4.translate(river, [0.0, -0.23, 0.0]);
  river = mat4.scale(river, [2, 0.2, 1.0]);
  drawSquare(river, rgb256(0, 102, 255));

  drawRiverLines(-0.7, -0.22);
  drawRiverLines(0.0, -0.18);
  drawRiverLines(0.7, -0.295);
  // draw a moving boat on the river
  const boat1Color = rgb256(242, 0, 0);
  const boat2Color = rgb256(115, 43, 166);
  drawBoat(model, boat1X, boat1Y, 0.18, boat1Color);
  drawBoat(model, boat2X, boat2Y, 0.11, boat2Color);
}

// Draw boat base as a trapezoid (central rectangle with two triangles to form slanted edges)
function drawBoatBase(mMatrix, cx, cy, scale) {
  const baseColor = rgb256(204, 204, 204);
  const bodyW = 0.65 * scale;
  const bodyH = 0.15 * scale;

  // central rectangle
  let center = mat4.create(mMatrix);
  center = mat4.translate(center, [cx, cy - bodyH / 2, 0]);
  center = mat4.scale(center, [bodyW, bodyH, 1]);
  drawSquare(center, baseColor);

  // left triangle to make trapezoid
  let leftTri = mat4.create(mMatrix);
  leftTri = mat4.translate(leftTri, [cx - bodyW * 0.5, cy - bodyH / 2, 0]);
  leftTri = mat4.rotateZ(leftTri, Math.PI);
  leftTri = mat4.scale(leftTri, [0.2 * scale, bodyH, 1]);
  drawTriangle(leftTri, baseColor);

  // right triangle
  let rightTri = mat4.create(mMatrix);
  rightTri = mat4.translate(rightTri, [cx + bodyW * 0.5, cy - bodyH / 2, 0]);
  rightTri = mat4.rotateZ(rightTri, Math.PI);
  rightTri = mat4.scale(rightTri, [0.2 * scale, bodyH, 1]);
  drawTriangle(rightTri, baseColor);
}

// Draw boat top: pole (rectangle) and triangular flag
function drawBoatTop(mMatrix, cx, cy, scale, color) {
  const poleColor = rgb256(0, 0, 0);
  const flagColor = color;
  const poleH = 1.4 * scale;
  const poleW = 0.06 * scale;

  // pole (rectangle)
  let pole = mat4.create(mMatrix);
  pole = mat4.translate(pole, [cx, cy + poleH / 2, 0]);
  pole = mat4.scale(pole, [poleW, poleH, 1]);
  drawSquare(pole, poleColor);

  // draw Thread
  let thread = mat4.create(mMatrix);
  thread = mat4.translate(thread, [cx - 0.38 * scale, cy + 0.55 * scale, 0]);
  thread = mat4.rotateZ(thread, -0.5);
  thread = mat4.scale(thread, [0.02 * scale, 1.5 * scale, 1]);
  drawSquare(thread, poleColor);

  // flag: triangle anchored at top of pole
  const flagW = 1.1 * scale;
  const flagH = 1 * scale;
  let flag = mat4.create(mMatrix);
  flag = mat4.translate(flag, [cx + flagH / 2 + poleW / 2, cy + poleH / 2, 0]);
  flag = mat4.rotateZ(flag, -Math.PI / 2);
  flag = mat4.scale(flag, [flagW, flagH, 1]);
  drawTriangle(flag, flagColor);
}

// Compose the boat from base and top; boat1X moves left-right and flips flag direction visually by flipping flag placement when moving left
function drawBoat(mMatrix, cx, cy, scale, color) {
  // base
  drawBoatTop(mMatrix, cx, cy, scale, color);
  drawBoatBase(mMatrix, cx, cy, scale * 2);
}

//// River Ended

//// Main Land

function drawhouseRoof(mMatrix, cx, cy, scale) {
  const roofColor = rgb256(255, 77, 0);
  const roofHeight = 0.18 * scale;
  const roofWidth = 0.4 * scale;

  // roof center
  let roofCenter = mat4.create(mMatrix);
  roofCenter = mat4.translate(roofCenter, [cx, cy, 0]);
  roofCenter = mat4.scale(roofCenter, [roofWidth, roofHeight, 1]);
  drawSquare(roofCenter, roofColor);

  // small left triangle to make trapezoid effect
  const triBase = 0.18 * scale;
  let leftTri = mat4.create(mMatrix);
  leftTri = mat4.translate(leftTri, [cx - roofWidth / 2, cy, 0]);
  leftTri = mat4.scale(leftTri, [triBase, roofHeight, 1]);
  drawTriangle(leftTri, roofColor);

  let rightTri = mat4.create(mMatrix);
  rightTri = mat4.translate(rightTri, [cx + roofWidth / 2, cy, 0]);
  rightTri = mat4.scale(rightTri, [triBase, roofHeight, 1]);
  drawTriangle(rightTri, roofColor);
}

function drawHouseBody(mMatrix, cx, cy, scale) {
  const bodyColor = rgb256(229, 229, 229);
  const doorColor = rgb256(229, 178, 0);
  const bodyHeight = 0.4 * scale;
  const bodyWidth = 0.6 * scale;
  const windowColor = rgb256(229, 178, 0);

  // house body (rectangle)
  let body = mat4.create(mMatrix);
  body = mat4.translate(body, [cx, cy, 0]);
  body = mat4.scale(body, [bodyWidth, bodyHeight, 1]);
  drawSquare(body, bodyColor);

  // door
  const doorHeight = 0.18 * scale;
  const doorWidth = 0.1 * scale;
  let door = mat4.create(mMatrix);
  door = mat4.translate(door, [cx, cy - bodyHeight / 2 + doorHeight / 2, 0]);
  door = mat4.scale(door, [doorWidth, doorHeight, 1]);
  drawSquare(door, doorColor);

  // windows (left and right)
  let windowWidth = 0.08 * scale;
  let w1 = mat4.create(mMatrix);
  w1 = mat4.translate(w1, [cx - 0.15 * scale, cy + windowWidth / 2, 0]);
  w1 = mat4.scale(w1, [windowWidth, windowWidth, 1]);
  drawSquare(w1, windowColor);

  let w2 = mat4.create(mMatrix);
  w2 = mat4.translate(w2, [cx + 0.15 * scale, cy + windowWidth / 2, 0]);
  w2 = mat4.scale(w2, [windowWidth, windowWidth, 1]);
  drawSquare(w2, windowColor);

  return bodyHeight;
}

// Draw a simple house at (cx, cy) with overall scale
function drawHouse(mMatrix, cx, cy, scale) {
  const bodyHeight = drawHouseBody(mMatrix, cx, cy, scale * 1.1);
  drawhouseRoof(mMatrix, cx, cy + bodyHeight / 2, scale * 1.4);
}

// Draw a tyre (circle) at (cx, cy) with radius r (in world units)
function drawTyre(mMatrix, cx, cy, r) {
  let t = mat4.create(mMatrix);
  t = mat4.translate(t, [cx, cy, 0]);
  t = mat4.scale(t, [r, r, 1]);
  drawCircle(t, rgb256(20, 20, 20));

  let it = mat4.create(mMatrix);
  it = mat4.translate(it, [cx, cy, 0]);
  it = mat4.scale(it, [r * 0.8, r * 0.8, 1]);
  drawCircle(it, rgb256(128, 128, 128));
}

// Draw car body (trapezoid) and attach two tyres (front/back)
function drawCarBody(mMatrix, cx, cy, scale) {
  const bodyColor = rgb256(0, 128, 229);
  const bodyWidth = 0.6 * scale;
  const bodyHeight = 0.15 * scale;

  // tyres positions relative to body
  const tyreR = 0.06 * scale;
  const backX = cx - bodyWidth * 0.35;
  const frontX = cx + bodyWidth * 0.35;
  const tyreY = cy - bodyHeight / 2 - tyreR * 0.6;
  drawTyre(mMatrix, backX, tyreY, tyreR);
  drawTyre(mMatrix, frontX, tyreY, tyreR);

  // central rectangle portion (middle of trapezoid)
  let bodyCenter = mat4.create(mMatrix);
  bodyCenter = mat4.translate(bodyCenter, [cx, cy, 0]);
  bodyCenter = mat4.scale(bodyCenter, [bodyWidth, bodyHeight, 1]);
  drawSquare(bodyCenter, bodyColor);

  // left small triangle to create slanted edge
  let leftTri = mat4.create(mMatrix);
  leftTri = mat4.translate(leftTri, [cx - bodyWidth / 2, cy, 0]);
  leftTri = mat4.scale(leftTri, [0.2 * scale, bodyHeight, 1]);
  drawTriangle(leftTri, bodyColor);

  // right small triangle
  let rightTri = mat4.create(mMatrix);
  rightTri = mat4.translate(rightTri, [cx + bodyWidth / 2, cy, 0]);
  rightTri = mat4.scale(rightTri, [0.2 * scale, bodyHeight, 1]);
  drawTriangle(rightTri, bodyColor);
}

// Draw car top as a semicircle sitting on the body
function drawCarTop(mMatrix, cx, cy, scale) {
  const topColor = rgb256(0, 77, 178);
  const topR = 0.25 * scale;
  // draw full circle then body will cover lower half, giving semicircle appearance
  let top = mat4.create(mMatrix);
  top = mat4.translate(top, [cx, cy + 0.02 * scale, 0]);
  top = mat4.scale(top, [topR, topR * 0.6, 1]);
  drawCircle(top, topColor);

  let wind = mat4.create(mMatrix);
  wind = mat4.translate(wind, [cx, cy + 0.02 * scale, 0]);
  wind = mat4.scale(wind, [topR * 1.2, topR * 0.65, 1]);
  drawSquare(wind, rgb256(204, 204, 229));
}

// Draw a car at center (cx, cy) with overall scale
function drawCar(mMatrix, cx, cy, scale) {
  // top first (so body drawn later covers lower half)
  drawCarTop(mMatrix, cx, cy + 0.06 * scale, scale);
  drawCarBody(mMatrix, cx, cy - 0.02 * scale, scale);
}

// Draw windmill fan: circular center with 4 triangular blades rotated by angle
function drawFan(mMatrix, cx, cy, radius, angle) {
  const centerColor = rgb256(0, 0, 0);
  const bladeColor = rgb256(178, 178, 0);

  // 4 blades
  const bladeLen = radius * 1.8;
  const bladeWidth = radius * 0.5;
  for (let i = 0; i < 4; i++) {
    const a = angle + (i * Math.PI) / 2;
    let b = mat4.create(mMatrix);
    b = mat4.translate(b, [cx, cy, 0]);
    b = mat4.rotate(b, a, [0, 0, 1]);
    // translate along x by half blade length (so triangle touches center)
    b = mat4.translate(b, [0, -bladeLen / 2, 0]);
    // scale triangle to blade size
    b = mat4.scale(b, [bladeWidth, bladeLen, 1]);
    drawTriangle(b, bladeColor);
  }

  // center circle
  let c = mat4.create(mMatrix);
  c = mat4.translate(c, [cx, cy, 0]);
  c = mat4.scale(c, [radius * 0.25, radius * 0.25, 1]);
  drawCircle(c, centerColor);
}

function drawPole(mMatrix, cx, baseY, height, width) {
  const poleColor = rgb256(51, 51, 51);
  let p = mat4.create(mMatrix);
  p = mat4.translate(p, [cx, baseY + height / 2, 0]);
  p = mat4.scale(p, [width, height, 1]);
  drawSquare(p, poleColor);
}

function drawWindmill(mMatrix, cx, baseY, scale, rotation) {
  // pole height relative to scale
  const poleH = 0.5 * scale;
  const poleW = 0.03 * scale;
  drawPole(mMatrix, cx, baseY, poleH, poleW);
  // fan at top of pole
  drawFan(mMatrix, cx, baseY + poleH, 0.12 * scale, rotation);
}

function drawGrassCircle(mMatrix, cx, cy, r, color) {
  let localMatrix = mat4.create(mMatrix);
  localMatrix = mat4.translate(localMatrix, [cx, cy, 0]);
  localMatrix = mat4.scale(localMatrix, [r, r * 0.7, 1]);
  drawCircle(localMatrix, color);
}

function drawGrass(mMatrix, cx, cy, size) {
  const r1 = size * 0.6;
  const r2 = size * 1.2;
  const r3 = size * 0.6;
  const color1 = rgb256(0, 178, 0, 1);
  const color2 = rgb256(0, 153, 0, 1);
  const color3 = rgb256(0, 102, 0, 1);

  let circ1 = mat4.create(mMatrix);
  circ1 = mat4.translate(circ1, [cx - size * 1.3, cy - size * 0.1, 0]);
  circ1 = mat4.scale(circ1, [r1, r1, 1]);
  drawCircle(circ1, color1);

  let circ2 = mat4.create(mMatrix);
  circ2 = mat4.translate(circ2, [cx + size * 1.3, cy - size * 0.1, 0]);
  circ2 = mat4.scale(circ2, [r3, r3, 1]);
  drawCircle(circ2, color3);

  let circ3 = mat4.create(mMatrix);
  circ3 = mat4.translate(circ3, [cx, cy, 0]);
  circ3 = mat4.scale(circ3, [r2, r2 * 0.65, 1]);
  drawCircle(circ3, color2);
}

function drawGrasses() {
  let grasses = [
    { x: -0.9, y: -0.66, r: 0.07 },
    { x: -0.235, y: -0.63, r: 0.1 },
    { x: -0.12, y: -1.08, r: 0.2 },
    { x: 1.02, y: -0.49, r: 0.1 },
  ];
  grasses.forEach((grass) => {
    drawGrass(model, grass.x, grass.y, grass.r);
  });
}

function drawRoad() {
  const roadColor = rgb256(102, 178, 51);
  let r = mat4.create(model);
  r = mat4.translate(r, [0.35, -0.8, 0]);
  r = mat4.rotate(r, Math.PI / 4 + 0.1, [0, 0, 1]);
  r = mat4.scale(r, [1.8, 1.6, 1]);
  drawTriangle(r, roadColor);
}

function drawMainLand() {
  // Ground strip for main land
  let land = mat4.create(model);
  land = mat4.translate(land, [0.0, -0.68, 0.0]);
  land = mat4.scale(land, [2, 0.7, 1.0]);
  // drawSquare(land, rgb256(0, 200, 100));

  // Draw some grass
  drawGrasses();
  // Draw a few houses
  drawHouse(model, -0.6, -0.55, 0.75);
  // Draw a car near the house
  drawCar(model, -0.5, -0.85, 0.6);
  // Draw a windmill on the right side of the main land
  drawWindmill(model, 0.53, -0.38, 0.8, windRotation);
  drawWindmill(model, 0.7, -0.54, 1.0, windRotation);
}

//// Main Land Ended

// Rendering mode control
function setRenderMode(mode) {
  switch (mode) {
    case "POINTS":
      currentRenderMode = gl.POINTS;
      break;
    case "LINES":
      currentRenderMode = gl.LINE_LOOP;
      break;
    case "TRIANGLES":
      currentRenderMode = gl.TRIANGLES;
      break;
  }
  drawScene(); // Redraw with new mode
}

// Main drawing function
function drawScene() {
  gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
  gl.clearColor(0.0, 0.0, 0.0, 1.0); // Light blue sky background
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Reset model matrix
  mat4.identity(model);
  // Layered scene back-to-front
  drawSky();
  drawMountainLand();
  drawRoad();
  drawRiver();
  drawMainLand();
}

// Main entry point
function webGLStart() {
  canvas = document.getElementById("mainCanvas");
  if (!canvas) {
    alert("Canvas not found!");
    return;
  }

  initGL(canvas);
  shaderProgram = initShaders();

  // Get shader locations
  aPositionLocation = gl.getAttribLocation(shaderProgram, "aPosition");
  uMMatrixLocation = gl.getUniformLocation(shaderProgram, "uMMatrix");
  uColorLocation = gl.getUniformLocation(shaderProgram, "uColor");
  uPointSizeLocation = gl.getUniformLocation(shaderProgram, "uPointSize");

  // Enable vertex attribute
  gl.enableVertexAttribArray(aPositionLocation);

  // Initialize buffers
  initSquareBuffer();
  initCircleBuffer();
  initTriangleBuffer();

  // Set initial render mode after WebGL context exists
  currentRenderMode = gl.TRIANGLES;

  // Default point size (useful for POINTS render mode)
  if (uPointSizeLocation) gl.uniform1f(uPointSizeLocation, 4.0);

  // Animation loop for rotating moon and any future time-based animations
  let lastTime = performance.now();
  function animate(now) {
    const dt = (now - lastTime) / 1000.0; // seconds
    lastTime = now;
    // update moon rotation
    moonRotation += degToRad(moonSpeedDeg) * dt;
    // update windmill rotation
    windRotation += degToRad(windSpeedDeg) * dt;
    // update boat position and reverse at bounds
    boat1X += boat1Dir * boat1Speed * dt;
    if (boat1X > boat1MaxX) {
      boat1X = boat1MaxX;
      boat1Dir = -1;
    } else if (boat1X < boat1MinX) {
      boat1X = boat1MinX;
      boat1Dir = 1;
    }

    boat2X += boat2Dir * boat2Speed * dt;
    if (boat2X > boat2MaxX) {
      boat2X = boat2MaxX;
      boat2Dir = -1;
    } else if (boat2X < boat2MinX) {
      boat2X = boat2MinX;
      boat2Dir = 1;
    }

    // Update twinkle value which goes from range [0, 1] to [0.1, 1.4]
    if (twinkleDir == 1) {
      twinkle += dt * twinkleSpeed;
      if (twinkle >= MAX_TWINKLE) {
        twinkleDir = 0;
      }
    } else {
      twinkle -= dt * twinkleSpeed;
      if (twinkle <= MIN_TWINKLE) {
        twinkleDir = 1;
      }
    }

    drawScene();
    requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);
}
