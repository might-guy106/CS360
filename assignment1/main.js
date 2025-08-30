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

  let starMatrix = mat4.create(model);
  starMatrix = mat4.translate(starMatrix, [0.6, 0.7, 0.0]);
  // TODO Stars
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
  let land = mat4.create(model);
  land = mat4.translate(land, [0.0, -0.15, 0.0]);
  land = mat4.scale(land, [2, 0.1, 1.0]);
  drawSquare(land, rgb256(0, 229, 128));
  const treeBaseY = -0.15 + 0.05;
  drawTree(model, 0.8, treeBaseY, 0.8);
  drawTree(model, 0.6, treeBaseY, 0.9);
  drawTree(model, 0.4, treeBaseY, 0.7);
}

//// Mountain Land Ended

//// River

function drawRiverLines(x, y) {
  const lineColor = rgb256(255, 255, 255);
  const lineWidth = 0.002;
  const lineLength = 0.4;

  let line = mat4.create(model);
  line = mat4.translate(line, [x, y, 0.0]);
  line = mat4.scale(line, [lineLength, lineWidth, 1.0]);
  drawSquare(line, lineColor);
}

function drawRiver() {
  let river = mat4.create(model);
  river = mat4.translate(river, [0.0, -0.21, 0.0]);
  river = mat4.scale(river, [2, 0.15, 1.0]);
  drawSquare(river, rgb256(0, 102, 255));

  drawRiverLines(-0.7, -0.22);
  drawRiverLines(0.6, -0.25);
  drawRiverLines(0.0, -0.18);
  // TODO: boats
}

//// River Ended

//// Main Land

function drawMainLand() {
  // Placeholder ground line (optional) and debug primitives currently used.
  // TODO: add house, car, windmill (with rotating blades) below river.
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

  // Draw the scene
  drawScene();

  // Animation loop for rotating moon and any future time-based animations
  let lastTime = performance.now();
  function animate(now) {
    const dt = (now - lastTime) / 1000.0; // seconds
    lastTime = now;
    // update moon rotation
    moonRotation += degToRad(moonSpeedDeg) * dt;
    // keep in range
    if (moonRotation > Math.PI * 2) moonRotation -= Math.PI * 2;
    drawScene();
    requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);
}
