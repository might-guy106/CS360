// Draw a 3D sphere in WebGL

var gl;
var canvas;

var matrixStack = [];

var cubeBuf;
var cubeIndexBuf;
var cubeNormalBuf;
var spBuf;
var spIndexBuf;
var spNormalBuf;

var spVerts = [];
var spIndicies = [];
var spNormals = [];

var aPositionLocation;
var aNormalLocation;
var uPMatrixLocation;
var uMMatrixLocation;
var uVMatrixLocation;
var normalMatrixLocation;

var degree1 = 0.0;
var degree0 = 0.0;
var degree2 = 0.0;
var degree3 = 0.0;
var degree4 = 0.0;
var degree5 = 0.0;
var prevMouseX = 0.0;
var prevMouseY = 0.0;

var scene = 0;

// initialize model, view, and projection matrices
var vMatrix = mat4.create(); // view matrix
var mMatrix = mat4.create(); // model matrix
var pMatrix = mat4.create(); //projection matrix
var uNormalMatrix = mat3.create(); // normal matrix

var lightPosition = [5, 4, 4];
var ambientColor = [1, 1, 1];
var diffuseColor = [1.0, 1.0, 1.0];
var specularColor = [1.0, 1.0, 1.0];

// specify camera/eye coordinate system parameters
var eyePos = [0.0, 0.0, 2.0];
var COI = [0.0, 0.0, 0.0];
var viewUp = [0.0, 1.0, 0.0];

function initGL(canvas) {
  try {
    gl = canvas.getContext("webgl2"); // the graphics webgl2 context
    gl.viewportWidth = canvas.width; // the width of the canvas
    gl.viewportHeight = canvas.height; // the height
  } catch (e) {}
  if (!gl) {
    alert("WebGL initialization failed");
  }
}

function degToRad(degrees) {
  return (degrees * Math.PI) / 180;
}

function pushMatrix(stack, m) {
  //necessary because javascript only does shallow push
  var copy = mat4.create(m);
  stack.push(copy);
}

function popMatrix(stack) {
  if (stack.length > 0) return stack.pop();
  else console.log("stack has no matrix to pop!");
}

//////////////////////////////////////////////////////////////////////
//Main drawing routine
function drawScene1() {
  // set up the view matrix, multiply into the modelview matrix
  mat4.identity(vMatrix);
  vMatrix = mat4.lookAt(eyePos, COI, viewUp, vMatrix);

  //set up perspective projection matrix
  mat4.identity(pMatrix);
  mat4.perspective(50, 1.0, 0.1, 1000, pMatrix);

  //set up the model matrix
  mat4.identity(mMatrix);
  mat4.identity(uNormalMatrix);

  // transformations applied here on model matrix
  mMatrix = mat4.rotate(mMatrix, degToRad(degree0), [0, 1, 0]);
  mMatrix = mat4.rotate(mMatrix, degToRad(degree1), [1, 0, 0]);

  // rotation to get the default position
  mMatrix = mat4.rotate(mMatrix, 0.5, [0, 1, 0]);
  mMatrix = mat4.rotate(mMatrix, 0.2, [1, 0, 0]);
  mMatrix = mat4.rotate(mMatrix, 0.1, [0, 0, 1]);

  mMatrix = mat4.scale(mMatrix, [1.1, 1.1, 1.1]);
  mMatrix = mat4.translate(mMatrix, [0, -0.1, 0]);

  pushMatrix(matrixStack, mMatrix);
  mMatrix = mat4.translate(mMatrix, [0, 0.5, 0]);
  mMatrix = mat4.scale(mMatrix, [0.5, 0.5, 0.5]);

  // Now draw the sphere
  diffuseColor = [0, 0.35, 0.6];
  drawSphere(mMatrix, vMatrix, pMatrix);
  mMatrix = popMatrix(matrixStack);

  pushMatrix(matrixStack, mMatrix);
  mMatrix = mat4.translate(mMatrix, [0.0, -0.125, 0]);
  mMatrix = mat4.scale(mMatrix, [0.45, 0.76, 0.5]);

  // Draw the cube
  diffuseColor = [0.68, 0.68, 0.49];
  drawCube(mMatrix, vMatrix, pMatrix);
  mMatrix = popMatrix(matrixStack);
}

function drawScene2() {
  // set up the view matrix, multiply into the modelview matrix
  mat4.identity(vMatrix);
  vMatrix = mat4.lookAt(eyePos, COI, viewUp, vMatrix);

  //set up perspective projection matrix
  mat4.identity(pMatrix);
  mat4.perspective(50, 1.0, 0.1, 1000, pMatrix);

  //set up the model matrix
  mat4.identity(mMatrix);

  // transformations applied here on model matrix
  mMatrix = mat4.rotate(mMatrix, degToRad(degree2), [0, 1, 0]);
  mMatrix = mat4.rotate(mMatrix, degToRad(degree3), [1, 0, 0]);

  // rotation to get the default position
  mMatrix = mat4.rotate(mMatrix, 0.05, [0, 1, 0]);

  mMatrix = mat4.scale(mMatrix, [0.95, 0.95, 0.95]);

  pushMatrix(matrixStack, mMatrix);
  mMatrix = mat4.translate(mMatrix, [0, -0.45, 0.1]);
  mMatrix = mat4.scale(mMatrix, [0.7, 0.7, 0.7]);

  diffuseColor = [0.73, 0.73, 0.73];
  drawSphere(mMatrix, vMatrix, pMatrix);
  mMatrix = popMatrix(matrixStack);

  pushMatrix(matrixStack, mMatrix);
  mMatrix = mat4.translate(mMatrix, [-0.36, -0.05, 0.1]);
  mMatrix = mat4.scale(mMatrix, [0.4, 0.4, 0.4]);
  mMatrix = mat4.rotate(mMatrix, 0.5, [1, 0, 0]);
  mMatrix = mat4.rotate(mMatrix, -0.45, [0, 0, 1]);
  mMatrix = mat4.rotate(mMatrix, -0.5, [0, 1, 0]);

  diffuseColor = [0, 0.52, 0];
  drawCube(mMatrix, vMatrix, pMatrix);

  mMatrix = popMatrix(matrixStack);

  pushMatrix(matrixStack, mMatrix);
  mMatrix = mat4.translate(mMatrix, [-0.18, 0.24, 0.25]);
  mMatrix = mat4.scale(mMatrix, [0.4, 0.4, 0.4]);

  diffuseColor = [0.73, 0.73, 0.73];
  drawSphere(mMatrix, vMatrix, pMatrix);
  mMatrix = popMatrix(matrixStack);

  pushMatrix(matrixStack, mMatrix);
  mMatrix = mat4.translate(mMatrix, [0.095, 0.41, 0.3]);
  mMatrix = mat4.scale(mMatrix, [0.25, 0.25, 0.25]);
  mMatrix = mat4.rotate(mMatrix, 0.5, [1, 0, 0]);
  mMatrix = mat4.rotate(mMatrix, 0.5, [0, 0, 1]);
  mMatrix = mat4.rotate(mMatrix, 0.2, [0, 1, 0]);

  diffuseColor = [0, 0.52, 0];
  drawCube(mMatrix, vMatrix, pMatrix);

  mMatrix = popMatrix(matrixStack);

  pushMatrix(matrixStack, mMatrix);
  mMatrix = mat4.translate(mMatrix, [-0.02, 0.6, 0.4]);
  mMatrix = mat4.scale(mMatrix, [0.25, 0.25, 0.25]);

  diffuseColor = [0.73, 0.73, 0.73];
  drawSphere(mMatrix, vMatrix, pMatrix);
  mMatrix = popMatrix(matrixStack);
}

function drawScene3() {
  // set up the view matrix, multiply into the modelview matrix
  mat4.identity(vMatrix);
  vMatrix = mat4.lookAt(eyePos, COI, viewUp, vMatrix);

  //set up perspective projection matrix
  mat4.identity(pMatrix);
  mat4.perspective(50, 1.0, 0.1, 1000, pMatrix);

  //set up the model matrix
  mat4.identity(mMatrix);

  // transformations applied here on model matrix
  mMatrix = mat4.rotate(mMatrix, degToRad(degree4), [0, 1, 0]);
  mMatrix = mat4.rotate(mMatrix, degToRad(degree5), [1, 0, 0]);

  pushMatrix(matrixStack, mMatrix);
  mMatrix = mat4.translate(mMatrix, [0, -0.6, 0.1]);
  mMatrix = mat4.scale(mMatrix, [0.4, 0.4, 0.4]);

  diffuseColor = [0, 0.69, 0.14];
  drawSphere(mMatrix, vMatrix, pMatrix);
  mMatrix = popMatrix(matrixStack);

  pushMatrix(matrixStack, mMatrix);
  mMatrix = mat4.translate(mMatrix, [0.01, -0.38, 0.1]);
  mMatrix = mat4.rotate(mMatrix, Math.PI / 4, [1, 1, 1]);
  mMatrix = mat4.rotate(mMatrix, -0.6, [0, 0, 1]);
  mMatrix = mat4.rotate(mMatrix, 0.1, [0, 1, 0]);
  mMatrix = mat4.rotate(mMatrix, -0.1, [1, 0, 0]);
  mMatrix = mat4.scale(mMatrix, [1.35, 0.03, 0.25]);

  diffuseColor = [0.93, 0.04, 0.07];
  drawCube(mMatrix, vMatrix, pMatrix);

  mMatrix = popMatrix(matrixStack);

  pushMatrix(matrixStack, mMatrix);
  mMatrix = mat4.translate(mMatrix, [-0.35, -0.21, 0.4]);
  mMatrix = mat4.scale(mMatrix, [0.3, 0.3, 0.3]);

  diffuseColor = [0.26, 0.27, 0.53];
  drawSphere(mMatrix, vMatrix, pMatrix);
  mMatrix = popMatrix(matrixStack);

  pushMatrix(matrixStack, mMatrix);
  mMatrix = mat4.translate(mMatrix, [0.35, -0.21, -0.2]);
  mMatrix = mat4.scale(mMatrix, [0.3, 0.3, 0.3]);

  diffuseColor = [0.1, 0.32, 0.3];
  drawSphere(mMatrix, vMatrix, pMatrix);
  mMatrix = popMatrix(matrixStack);

  pushMatrix(matrixStack, mMatrix);
  mMatrix = mat4.translate(mMatrix, [-0.35, -0.07, 0.45]);
  mMatrix = mat4.rotate(mMatrix, (3 * Math.PI) / 4, [1, 1, 1]);
  mMatrix = mat4.rotate(mMatrix, -1.45, [0, 0, 1]);
  mMatrix = mat4.rotate(mMatrix, 0.6, [0, 1, 0]);
  mMatrix = mat4.rotate(mMatrix, 0.1, [1, 0, 0]);
  mMatrix = mat4.scale(mMatrix, [0.6, 0.03, 0.3]);

  diffuseColor = [0.7, 0.6, 0.0];
  drawCube(mMatrix, vMatrix, pMatrix);

  mMatrix = popMatrix(matrixStack);

  pushMatrix(matrixStack, mMatrix);
  mMatrix = mat4.translate(mMatrix, [0.35, -0.07, -0.2]);
  mMatrix = mat4.rotate(mMatrix, (3 * Math.PI) / 4, [1, 1, 1]);
  mMatrix = mat4.rotate(mMatrix, -1.45, [0, 0, 1]);
  mMatrix = mat4.rotate(mMatrix, 0.6, [0, 1, 0]);
  mMatrix = mat4.rotate(mMatrix, 0.1, [1, 0, 0]);
  mMatrix = mat4.scale(mMatrix, [0.6, 0.03, 0.3]);

  diffuseColor = [0.18, 0.62, 0];
  drawCube(mMatrix, vMatrix, pMatrix);

  mMatrix = popMatrix(matrixStack);

  pushMatrix(matrixStack, mMatrix);
  mMatrix = mat4.translate(mMatrix, [-0.35, 0.1, 0.4]);
  mMatrix = mat4.scale(mMatrix, [0.3, 0.3, 0.3]);

  diffuseColor = [0.69, 0, 0.69];
  drawSphere(mMatrix, vMatrix, pMatrix);
  mMatrix = popMatrix(matrixStack);

  pushMatrix(matrixStack, mMatrix);
  mMatrix = mat4.translate(mMatrix, [0.35, 0.1, -0.2]);
  mMatrix = mat4.scale(mMatrix, [0.3, 0.3, 0.3]);

  diffuseColor = [0.65, 0.47, 0.12];
  drawSphere();
  mMatrix = popMatrix(matrixStack);

  pushMatrix(matrixStack, mMatrix);
  mMatrix = mat4.translate(mMatrix, [0.01, 0.265, 0.1]);
  mMatrix = mat4.rotate(mMatrix, Math.PI / 4, [1, 1, 1]);
  mMatrix = mat4.rotate(mMatrix, -0.6, [0, 0, 1]);
  mMatrix = mat4.rotate(mMatrix, 0.12, [0, 1, 0]);
  mMatrix = mat4.rotate(mMatrix, -0.25, [1, 0, 0]);
  mMatrix = mat4.scale(mMatrix, [1.35, 0.03, 0.25]);

  diffuseColor = [0.93, 0.04, 0.07];
  drawCube();

  mMatrix = popMatrix(matrixStack);

  pushMatrix(matrixStack, mMatrix);
  mMatrix = mat4.translate(mMatrix, [0, 0.48, 0.1]);
  mMatrix = mat4.scale(mMatrix, [0.4, 0.4, 0.4]);

  diffuseColor = [0.54, 0.54, 0.67];
  drawSphere();
  mMatrix = popMatrix(matrixStack);
}

function drawScene() {
  // You need to enable scissor_test to be able to use multiple viewports
  gl.enable(gl.SCISSOR_TEST);

  // Now define 3 different viewport areas for drawing

  ////////////////////////////////////////
  // Left viewport area
  shaderProgram = flatShaderProgram;
  gl.useProgram(shaderProgram);

  gl.viewport(0, 0, 400, 400);
  gl.scissor(0, 0, 400, 400);

  gl.clearColor(0.85, 0.85, 0.95, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  //get locations of attributes and uniforms declared in the shader
  aPositionLocation = gl.getAttribLocation(shaderProgram, "aPosition");
  aNormalLocation = gl.getAttribLocation(shaderProgram, "aNormal");
  uMMatrixLocation = gl.getUniformLocation(shaderProgram, "uMMatrix");
  uVMatrixLocation = gl.getUniformLocation(shaderProgram, "uVMatrix");
  uPMatrixLocation = gl.getUniformLocation(shaderProgram, "uPMatrix");
  uLightPositionLocation = gl.getUniformLocation(
    shaderProgram,
    "uLightPosition"
  );
  uAmbientColorLocation = gl.getUniformLocation(shaderProgram, "uAmbientColor");
  uDiffuseColorLocation = gl.getUniformLocation(shaderProgram, "uDiffuseColor");
  uSpecularColorLocation = gl.getUniformLocation(
    shaderProgram,
    "uSpecularColor"
  );

  //enable the attribute arrays
  gl.enableVertexAttribArray(aPositionLocation);
  gl.enableVertexAttribArray(aNormalLocation);

  //initialize buffers for the sphere
  initSphereBuffer();
  initCubeBuffer();

  gl.enable(gl.DEPTH_TEST);
  drawScene1();

  ////////////////////////////////////////
  // Mid viewport area
  shaderProgram = perVertShaderProgram;
  gl.useProgram(shaderProgram);

  gl.viewport(400, 0, 400, 400);
  gl.scissor(400, 0, 400, 400);

  gl.clearColor(0.95, 0.85, 0.85, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  //get locations of attributes and uniforms declared in the shader
  aPositionLocation = gl.getAttribLocation(shaderProgram, "aPosition");
  aNormalLocation = gl.getAttribLocation(shaderProgram, "aNormal");
  uMMatrixLocation = gl.getUniformLocation(shaderProgram, "uMMatrix");
  uVMatrixLocation = gl.getUniformLocation(shaderProgram, "uVMatrix");
  uPMatrixLocation = gl.getUniformLocation(shaderProgram, "uPMatrix");
  uLightPositionLocation = gl.getUniformLocation(
    shaderProgram,
    "uLightPosition"
  );
  uAmbientColorLocation = gl.getUniformLocation(shaderProgram, "uAmbientColor");
  uDiffuseColorLocation = gl.getUniformLocation(shaderProgram, "uDiffuseColor");
  uSpecularColorLocation = gl.getUniformLocation(
    shaderProgram,
    "uSpecularColor"
  );

  //enable the attribute arrays
  gl.enableVertexAttribArray(aPositionLocation);
  gl.enableVertexAttribArray(aNormalLocation);

  //initialize buffers for the sphere
  initSphereBuffer();
  initCubeBuffer();

  gl.enable(gl.DEPTH_TEST);
  drawScene2();

  ////////////////////////////////////////
  // Right viewport area
  shaderProgram = perFragShaderProgram;
  gl.useProgram(shaderProgram);

  gl.viewport(800, 0, 400, 400);
  gl.scissor(800, 0, 400, 400);

  gl.clearColor(0.85, 0.95, 0.85, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  //get locations of attributes and uniforms declared in the shader
  aPositionLocation = gl.getAttribLocation(shaderProgram, "aPosition");
  aNormalLocation = gl.getAttribLocation(shaderProgram, "aNormal");
  uMMatrixLocation = gl.getUniformLocation(shaderProgram, "uMMatrix");
  uVMatrixLocation = gl.getUniformLocation(shaderProgram, "uVMatrix");
  uPMatrixLocation = gl.getUniformLocation(shaderProgram, "uPMatrix");
  uLightPositionLocation = gl.getUniformLocation(
    shaderProgram,
    "uLightPosition"
  );
  uAmbientColorLocation = gl.getUniformLocation(shaderProgram, "uAmbientColor");
  uDiffuseColorLocation = gl.getUniformLocation(shaderProgram, "uDiffuseColor");
  uSpecularColorLocation = gl.getUniformLocation(
    shaderProgram,
    "uSpecularColor"
  );

  //enable the attribute arrays
  gl.enableVertexAttribArray(aPositionLocation);
  gl.enableVertexAttribArray(aNormalLocation);

  //initialize buffers for the sphere
  initSphereBuffer();
  initCubeBuffer();

  gl.enable(gl.DEPTH_TEST);
  drawScene3();
}

function onMouseDown(event) {
  document.addEventListener("mousemove", onMouseMove, false);
  document.addEventListener("mouseup", onMouseUp, false);
  document.addEventListener("mouseout", onMouseOut, false);

  if (
    event.layerX <= canvas.width &&
    event.layerX >= 0 &&
    event.layerY <= canvas.height &&
    event.layerY >= 0
  ) {
    prevMouseX = event.clientX;
    prevMouseY = canvas.height - event.clientY;
    var yLim = prevMouseY <= 300 && prevMouseY >= -100;
    if (prevMouseX >= 50 && prevMouseX <= 450 && yLim) scene = 1;
    else if (prevMouseX >= 450 && prevMouseX <= 850 && yLim) scene = 2;
    else if (prevMouseX >= 850 && prevMouseX <= 1250 && yLim) scene = 3;
  }
}

function onMouseMove(event) {
  // make mouse interaction only within canvas

  var mouseX = event.clientX;
  var diffX1 = mouseX - prevMouseX;
  prevMouseX = mouseX;

  var mouseY = canvas.height - event.clientY;
  var diffY2 = mouseY - prevMouseY;
  prevMouseY = mouseY;

  console.log(mouseX, mouseY);

  // the '50' is added on the X-coordinate of the mouse because of the 50px
  // margin on the left of the canvas
  // the '100' is subtracted on the Y-coordinate of the mouse because of the
  // 50px margin and the header which is of approx 50px

  var yLim = mouseY <= 300 && mouseY >= -100;
  if (mouseX >= 50 && mouseX <= 450 && yLim && scene == 1) {
    degree0 = degree0 + diffX1 / 5;
    degree1 = degree1 - diffY2 / 5;
  } else if (mouseX >= 450 && mouseX <= 850 && yLim && scene == 2) {
    degree2 = degree2 + diffX1 / 5;
    degree3 = degree3 - diffY2 / 5;
  } else if (mouseX >= 850 && mouseX <= 1250 && yLim && scene == 3) {
    degree4 = degree4 + diffX1 / 5;
    degree5 = degree5 - diffY2 / 5;
  }
  drawScene();
}

function onMouseUp(event) {
  document.removeEventListener("mousemove", onMouseMove, false);
  document.removeEventListener("mouseup", onMouseUp, false);
  document.removeEventListener("mouseout", onMouseOut, false);
}

function onMouseOut(event) {
  document.removeEventListener("mousemove", onMouseMove, false);
  document.removeEventListener("mouseup", onMouseUp, false);
  document.removeEventListener("mouseout", onMouseOut, false);
}

// This is the entry point from the html
function webGLStart() {
  canvas = document.getElementById("assn2");
  document.addEventListener("mousedown", onMouseDown, false);

  // Get the light slider element
  const lightSlider = document.getElementById("light-slider");

  // Initialize light position
  let lightX = parseFloat(lightSlider.value);

  // Update light position when the slider changes
  lightSlider.addEventListener("input", (event) => {
    lightX = parseFloat(event.target.value);
    lightPosition = [lightX, 3.0, 4.0];

    // Redraw the scene
    drawScene();
  });

  // Get the camera slider element
  const cameraSlider = document.getElementById("camera-slider");

  // Initialize camera position
  let cameraZ = parseFloat(cameraSlider.value);

  // Update camera position when the slider changes
  cameraSlider.addEventListener("input", (event) => {
    cameraZ = parseFloat(event.target.value);
    eyePos = [0.0, 0.0, cameraZ];

    // Redraw the scene
    drawScene();
  });

  // initialize WebGL
  initGL(canvas);

  // initialize shader program
  flatShaderProgram = initShaders(flatVertexShaderCode, flatFragShaderCode);
  perVertShaderProgram = initShaders(
    perVertVertexShaderCode,
    perVertFragShaderCode
  );
  perFragShaderProgram = initShaders(
    perFragVertexShaderCode,
    perFragFragShaderCode
  );

  drawScene();
}

//
