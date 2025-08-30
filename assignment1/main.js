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

void main() {
  gl_Position = uMMatrix*vec4(aPosition,0.0,1.0);
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
// Complex Objects - Simple
//////////////////////////////////////////////////////////////////////////////////

// Draw a single mountain given its base (y of the base line), width, and height.
// The unit triangle is centered vertically (-0.5..0.5). Base after scaling is at (centerY - 0.5*height).
// To place the base at baseY we translate by baseY + 0.5*height (so center sits half height above base).
function drawMountain(mMatrix, x, baseY, width, height, color) {
  let local = mat4.create(mMatrix);
  local = mat4.translate(local, [x, baseY + 0.5 * height, 0]);
  local = mat4.scale(local, [width, height, 1]);
  drawTriangle(local, color);
}

// Draw a mountain with a shadow/highlight overlay triangle rotated about the top vertex.
// colorMain: base mountain color, colorOverlay: shadow/highlight color.
// angle (radians) optional; small negative tilts to the left.
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

function drawCircleAt(mMatrix, cx, cy, r, color) {
  let localMatrix = mat4.create(mMatrix);
  localMatrix = mat4.translate(localMatrix, [cx, cy, 0]);
  localMatrix = mat4.scale(localMatrix, [r, r * 0.6, 1]);
  drawCircle(localMatrix, color);
}

function drawCloud(mMatrix, size) {
  const r1 = size;
  const r2 = size * 0.8;
  const r3 = size * 0.6;

  // Place first cloud at 0
  const c1 = 0;
  // Second cloud
  const c2 = c1 + (r1 + r2) * 0.6;
  // Third cloud
  const c3 = c2 + (r2 + r3) * 0.8;

  drawCircleAt(mMatrix, c1, 0, r1, rgb256(178, 178, 178, 1));
  drawCircleAt(mMatrix, c2, -(r1 - r2) * 0.6, r2, rgb256(255, 255, 255, 1));
  drawCircleAt(mMatrix, c3, -(r1 - r2) * 0.6, r3, rgb256(178, 178, 178, 1));
}

function drawStar(mMatrix, twinkle) {
  var starColor = [1.0, 1.0, 0.8, twinkle];
  gl.uniformMatrix4fv(uMMatrixLocation, false, mMatrix);
  gl.uniform4fv(uColorLocation, starColor);
  gl.drawArrays(gl.POINTS, 0, 1);
}

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

// ================= Scene Layer Functions =================
function drawSky() {
  let skyMatrix = mat4.create(model);
  skyMatrix = mat4.translate(skyMatrix, [0.0, 0.6, 0.0]);
  drawCloud(skyMatrix, 0.2);
  // TODO: moon
  let starMatrix = mat4.create(model);
  starMatrix = mat4.translate(starMatrix, [0.6, 0.7, 0.0]);
  drawStar(starMatrix, 0.8);
}

function drawMountainLand() {
  drawMountains(model);
  let land = mat4.create(model);
  land = mat4.translate(land, [0.0, -0.15, 0.0]);
  land = mat4.scale(land, [2, 0.1, 1.0]);
  drawSquare(land, rgb256(0, 229, 128));
  const treeBaseY = -0.15 + 0.05;
  drawTree(model, -0.9, treeBaseY, 0.55);
  drawTree(model, -0.4, treeBaseY, 0.65);
  drawTree(model, 0.15, treeBaseY, 0.6);
}

function drawRiver() {
  let river = mat4.create(model);
  river = mat4.translate(river, [0.0, -0.21, 0.0]);
  river = mat4.scale(river, [2, 0.15, 1.0]);
  drawSquare(river, rgb256(0, 102, 255));
  // TODO: boats
}

function drawMainLand() {
  // Placeholder ground line (optional) and debug primitives currently used.
  // TODO: add house, car, windmill (with rotating blades) below river.
}

// ================= Complex Objects: Trees =================
// Tree made from: rectangle trunk (scaled square) + stacked triangle foliage layers.
// x: horizontal center, baseY: y position of ground contact, scale: overall size factor.
function drawTree(mMatrix, x, baseY, scale = 0.6) {
  const trunkColor = rgb256(120, 78, 40);
  const foliageColor = rgb256(34, 139, 34);
  const foliageHighlight = rgb256(50, 170, 60);
  const trunkHeight = 0.35 * scale;
  const trunkWidth = 0.1 * scale;
  const layers = 3;
  const layerBaseWidth = 0.55 * scale;
  const layerHeight = 0.3 * scale;
  const overlap = 0.12 * scale;

  let trunk = mat4.create(mMatrix);
  trunk = mat4.translate(trunk, [x, baseY + trunkHeight / 2, 0]);
  trunk = mat4.scale(trunk, [trunkWidth, trunkHeight, 1]);
  drawSquare(trunk, trunkColor);
  for (let i = 0; i < layers; i++) {
    const w = layerBaseWidth * (1 - i * 0.18);
    const h = layerHeight;
    const layerBase = baseY + trunkHeight - i * overlap;
    const centerY = layerBase + h / 2;
    let triM = mat4.create(mMatrix);
    triM = mat4.translate(triM, [x, centerY, 0]);
    triM = mat4.scale(triM, [w, h, 1]);
    drawTriangle(triM, i === layers - 1 ? foliageHighlight : foliageColor);
  }
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

  // Enable vertex attribute
  gl.enableVertexAttribArray(aPositionLocation);

  // Initialize buffers
  initSquareBuffer();
  initCircleBuffer();
  initTriangleBuffer();

  // Set initial render mode after WebGL context exists
  currentRenderMode = gl.TRIANGLES;

  // Draw the scene
  drawScene();
}
