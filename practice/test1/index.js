///////////////////////////////////////////////////////////////
//  A simple WebGL program that opens a canvas.
//
var gl;
var canvas;
var shaderProgram;

const vertexShaderCode = `#version 300 es
  in vec2 aPosition;
  in vec3 aColor;
  out vec3 fColor;

  void main() {
    fColor = aColor;
    gl_Position = vec4(aPosition, 0.0, 1.0);
  }
`;

const fragmentShaderCode = `#version 300 es
  precision mediump float;
  out vec4 fragColor;
  in vec3 fColor;

  void main() {
    fragColor = vec4(fColor, 1.0);
  }
`;

function vertexShaderSetup(vertexShaderCode) {
  var shader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(shader, vertexShaderCode);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert("Could not compile vertex shader: " + gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

function fragmentShaderSetup(fragmentShaderCode) {
  var shader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(shader, fragmentShaderCode);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert("Could not compile fragment shader: " + gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

function initShaders() {
  shaderProgram = gl.createProgram();

  var vertexShader = vertexShaderSetup(vertexShaderCode);
  var fragmentShader = fragmentShaderSetup(fragmentShaderCode);

  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);

  gl.linkProgram(shaderProgram);

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert("Could not initialise shaders");
  }

  gl.useProgram(shaderProgram);

  return shaderProgram;
}

function initGL(canvasEl) {
  try {
    gl = canvasEl.getContext("webgl2");
  } catch (e) {}
  if (!gl) {
    alert("WebGL initialization failed");
  }
}

////////////////////////////////////////////////////////////////////////
// Draws one colored rectangle (two triangles) using indexed (element) drawing.
function drawScene() {
  // 1. Set viewport & clear screen
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  // 2. Unique vertex data (4 vertices). Each vertex: x, y, r, g, b
  const vertices = new Float32Array([
    //  x,    y,     r, g, b
    0.5,
    0.5,
    1,
    0,
    0, // 0: top-right
    -0.5,
    0.5,
    0,
    1,
    0, // 1: top-left
    0.5,
    -0.5,
    0,
    0,
    1, // 2: bottom-right
    -0.5,
    -0.5,
    1,
    1,
    0, // 3: bottom-left
  ]);

  // 3. Indices tell WebGL which vertices make the two triangles
  // Triangle 1: 0,1,2   Triangle 2: 1,2,3
  const indices = new Uint16Array([0, 1, 2, 1, 2, 3]);

  // 4. Create & fill vertex buffer
  const vbo = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  // 5. Create & fill index buffer (ELEMENT_ARRAY_BUFFER must stay bound for drawElements)
  const ibo = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

  // 6. Look up attribute locations
  const aPosition = gl.getAttribLocation(shaderProgram, "aPosition");
  const aColor = gl.getAttribLocation(shaderProgram, "aColor");

  // 7. Describe interleaved layout: 5 floats per vertex (x,y,r,g,b)
  const stride = 5 * 4; // bytes per vertex

  // Position (first 2 floats)
  gl.enableVertexAttribArray(aPosition);
  gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, stride, 0);

  // Color (next 3 floats) offset = 2 floats = 8 bytes
  gl.enableVertexAttribArray(aColor);
  gl.vertexAttribPointer(aColor, 3, gl.FLOAT, false, stride, 2 * 4);

  // 8. Draw using indices
  gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
}

// Entry point called from HTML
function webGLStart() {
  canvas = document.getElementById("simpleHTML");
  if (!canvas) {
    alert("Canvas not found!");
    return;
  }
  initGL(canvas);
  initShaders();
  drawScene();
}

// Optional: automatically start if you want:
// window.onload = webGLStart;
