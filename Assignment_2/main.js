var gl;
var renderCanvas;
var viewportHeight;
var viewportWidth;

var transformStack = [];

var flatShadingShaderProgram;
var gouraudShaderProgram;
var phongShaderProgram;
var shaderProgram;

var cubeVertexBuffer;
var cubeIndexBuffer;
var cubeNormalBuffer;
var sphereVertexBuffer;
var sphereIndexBuffer;
var sphereNormalBuffer;

var sphereVertices = [];
var sphereIndices = [];
var sphereNormals = [];

var positionAttributeLocation;
var normalAttributeLocation;
var projectionMatrixUniformLocation;
var modelMatrixUniformLocation;
var viewMatrixUniformLocation;
var normalMatrixUniformLocation;
var lightPositionUniformLocation;
var ambientColorUniformLocation;
var diffuseColorUniformLocation;
var specularColorUniformLocation;

var firstSceneRotationY = 0.0;
var firstSceneRotationX = 0.0;
var secondSceneRotationX = 0.0;
var secondSceneRotationY = 0.0;
var thirdSceneRotationX = 0.0;
var thirdSceneRotationY = 0.0;
var previousMouseX = 0.0;
var previousMouseY = 0.0;

var currentScene = 0;

var viewMatrix = mat4.create();
var modelMatrix = mat4.create();
var projectionMatrix = mat4.create();
var normalMatrix = mat3.create();

var lightPosition = [5, 4, 4];
var ambientColor = [1, 1, 1];
var diffuseColor = [1.0, 1.0, 1.0];
var specularColor = [1.0, 1.0, 1.0];

var cameraPosition = [0.0, 0.0, 2.0];
var lookAtTarget = [0.0, 0.0, 0.0];
var upVector = [0.0, 1.0, 0.0];

function initializeWebGL(canvas) {
  try {
    gl = canvas.getContext("webgl2");
    gl.viewportWidth = canvas.width;
    gl.viewportHeight = canvas.height;
  } catch (e) {}
  if (!gl) {
    alert("WebGL initialization failed");
  }
}

function degreesToRadians(degrees) {
  return (degrees * Math.PI) / 180;
}

function pushMatrixToStack(stack, matrix) {
  const copy = mat4.create(matrix);
  stack.push(copy);
}

function popMatrixFromStack(stack) {
  if (stack.length > 0) return stack.pop();
  else console.log("stack has no matrix to pop!");
}

function renderFirstScene() {
  mat4.identity(viewMatrix);
  viewMatrix = mat4.lookAt(cameraPosition, lookAtTarget, upVector, viewMatrix);

  mat4.identity(projectionMatrix);
  mat4.perspective(50, 1.0, 0.1, 1000, projectionMatrix);

  mat4.identity(modelMatrix);
  mat4.identity(normalMatrix);

  modelMatrix = mat4.rotate(
    modelMatrix,
    degreesToRadians(firstSceneRotationX),
    [0, 1, 0]
  );
  modelMatrix = mat4.rotate(
    modelMatrix,
    degreesToRadians(firstSceneRotationY),
    [1, 0, 0]
  );

  modelMatrix = mat4.rotate(modelMatrix, 0.5, [0, 1, 0]);
  modelMatrix = mat4.rotate(modelMatrix, 0.2, [1, 0, 0]);
  modelMatrix = mat4.rotate(modelMatrix, 0.1, [0, 0, 1]);

  modelMatrix = mat4.scale(modelMatrix, [1.1, 1.1, 1.1]);
  modelMatrix = mat4.translate(modelMatrix, [0, -0.1, 0]);

  pushMatrixToStack(transformStack, modelMatrix);
  modelMatrix = mat4.translate(modelMatrix, [0, 0.5, 0]);
  modelMatrix = mat4.scale(modelMatrix, [0.5, 0.5, 0.5]);

  diffuseColor = [0, 0.35, 0.6];
  renderSphere(modelMatrix, viewMatrix, projectionMatrix);
  modelMatrix = popMatrixFromStack(transformStack);

  pushMatrixToStack(transformStack, modelMatrix);
  modelMatrix = mat4.translate(modelMatrix, [0.0, -0.125, 0]);
  modelMatrix = mat4.scale(modelMatrix, [0.45, 0.76, 0.5]);

  diffuseColor = [0.68, 0.68, 0.49];
  renderCube(modelMatrix, viewMatrix, projectionMatrix);
  modelMatrix = popMatrixFromStack(transformStack);
}

function renderSecondScene() {
  mat4.identity(viewMatrix);
  viewMatrix = mat4.lookAt(cameraPosition, lookAtTarget, upVector, viewMatrix);

  mat4.identity(projectionMatrix);
  mat4.perspective(50, 1.0, 0.1, 1000, projectionMatrix);

  mat4.identity(modelMatrix);

  modelMatrix = mat4.rotate(
    modelMatrix,
    degreesToRadians(secondSceneRotationX),
    [0, 1, 0]
  );
  modelMatrix = mat4.rotate(
    modelMatrix,
    degreesToRadians(secondSceneRotationY),
    [1, 0, 0]
  );

  modelMatrix = mat4.rotate(modelMatrix, 0.05, [0, 1, 0]);
  modelMatrix = mat4.scale(modelMatrix, [0.95, 0.95, 0.95]);

  pushMatrixToStack(transformStack, modelMatrix);
  modelMatrix = mat4.translate(modelMatrix, [0, -0.45, 0.1]);
  modelMatrix = mat4.scale(modelMatrix, [0.7, 0.7, 0.7]);

  diffuseColor = [0.73, 0.73, 0.73];
  renderSphere(modelMatrix, viewMatrix, projectionMatrix);
  modelMatrix = popMatrixFromStack(transformStack);

  pushMatrixToStack(transformStack, modelMatrix);
  modelMatrix = mat4.translate(modelMatrix, [-0.36, -0.05, 0.1]);
  modelMatrix = mat4.scale(modelMatrix, [0.4, 0.4, 0.4]);
  modelMatrix = mat4.rotate(modelMatrix, 0.5, [1, 0, 0]);
  modelMatrix = mat4.rotate(modelMatrix, -0.45, [0, 0, 1]);
  modelMatrix = mat4.rotate(modelMatrix, -0.5, [0, 1, 0]);

  diffuseColor = [0, 0.52, 0];
  renderCube(modelMatrix, viewMatrix, projectionMatrix);

  modelMatrix = popMatrixFromStack(transformStack);

  pushMatrixToStack(transformStack, modelMatrix);
  modelMatrix = mat4.translate(modelMatrix, [-0.18, 0.24, 0.25]);
  modelMatrix = mat4.scale(modelMatrix, [0.4, 0.4, 0.4]);

  diffuseColor = [0.73, 0.73, 0.73];
  renderSphere(modelMatrix, viewMatrix, projectionMatrix);
  modelMatrix = popMatrixFromStack(transformStack);

  pushMatrixToStack(transformStack, modelMatrix);
  modelMatrix = mat4.translate(modelMatrix, [0.095, 0.41, 0.3]);
  modelMatrix = mat4.scale(modelMatrix, [0.25, 0.25, 0.25]);
  modelMatrix = mat4.rotate(modelMatrix, 0.5, [1, 0, 0]);
  modelMatrix = mat4.rotate(modelMatrix, 0.5, [0, 0, 1]);
  modelMatrix = mat4.rotate(modelMatrix, 0.2, [0, 1, 0]);

  diffuseColor = [0, 0.52, 0];
  renderCube(modelMatrix, viewMatrix, projectionMatrix);

  modelMatrix = popMatrixFromStack(transformStack);

  pushMatrixToStack(transformStack, modelMatrix);
  modelMatrix = mat4.translate(modelMatrix, [-0.02, 0.6, 0.4]);
  modelMatrix = mat4.scale(modelMatrix, [0.25, 0.25, 0.25]);

  diffuseColor = [0.73, 0.73, 0.73];
  renderSphere(modelMatrix, viewMatrix, projectionMatrix);
  modelMatrix = popMatrixFromStack(transformStack);
}

function renderThirdScene() {
  mat4.identity(viewMatrix);
  viewMatrix = mat4.lookAt(cameraPosition, lookAtTarget, upVector, viewMatrix);

  mat4.identity(projectionMatrix);
  mat4.perspective(50, 1.0, 0.1, 1000, projectionMatrix);

  mat4.identity(modelMatrix);

  modelMatrix = mat4.rotate(
    modelMatrix,
    degreesToRadians(thirdSceneRotationX),
    [0, 1, 0]
  );
  modelMatrix = mat4.rotate(
    modelMatrix,
    degreesToRadians(thirdSceneRotationY),
    [1, 0, 0]
  );

  pushMatrixToStack(transformStack, modelMatrix);
  modelMatrix = mat4.translate(modelMatrix, [0, -0.6, 0.1]);
  modelMatrix = mat4.scale(modelMatrix, [0.4, 0.4, 0.4]);

  diffuseColor = [0, 0.69, 0.14];
  renderSphere(modelMatrix, viewMatrix, projectionMatrix);
  modelMatrix = popMatrixFromStack(transformStack);

  pushMatrixToStack(transformStack, modelMatrix);
  modelMatrix = mat4.translate(modelMatrix, [0.01, -0.38, 0.1]);
  modelMatrix = mat4.rotate(modelMatrix, Math.PI / 4, [1, 1, 1]);
  modelMatrix = mat4.rotate(modelMatrix, -0.6, [0, 0, 1]);
  modelMatrix = mat4.rotate(modelMatrix, 0.1, [0, 1, 0]);
  modelMatrix = mat4.rotate(modelMatrix, -0.1, [1, 0, 0]);
  modelMatrix = mat4.scale(modelMatrix, [1.35, 0.03, 0.25]);

  diffuseColor = [0.93, 0.04, 0.07];
  renderCube(modelMatrix, viewMatrix, projectionMatrix);

  modelMatrix = popMatrixFromStack(transformStack);

  pushMatrixToStack(transformStack, modelMatrix);
  modelMatrix = mat4.translate(modelMatrix, [-0.35, -0.21, 0.4]);
  modelMatrix = mat4.scale(modelMatrix, [0.3, 0.3, 0.3]);

  diffuseColor = [0.26, 0.27, 0.53];
  renderSphere(modelMatrix, viewMatrix, projectionMatrix);
  modelMatrix = popMatrixFromStack(transformStack);

  pushMatrixToStack(transformStack, modelMatrix);
  modelMatrix = mat4.translate(modelMatrix, [0.35, -0.21, -0.2]);
  modelMatrix = mat4.scale(modelMatrix, [0.3, 0.3, 0.3]);

  diffuseColor = [0.1, 0.32, 0.3];
  renderSphere(modelMatrix, viewMatrix, projectionMatrix);
  modelMatrix = popMatrixFromStack(transformStack);

  pushMatrixToStack(transformStack, modelMatrix);
  modelMatrix = mat4.translate(modelMatrix, [-0.35, -0.07, 0.45]);
  modelMatrix = mat4.rotate(modelMatrix, (3 * Math.PI) / 4, [1, 1, 1]);
  modelMatrix = mat4.rotate(modelMatrix, -1.45, [0, 0, 1]);
  modelMatrix = mat4.rotate(modelMatrix, 0.6, [0, 1, 0]);
  modelMatrix = mat4.rotate(modelMatrix, 0.1, [1, 0, 0]);
  modelMatrix = mat4.scale(modelMatrix, [0.6, 0.03, 0.3]);

  diffuseColor = [0.7, 0.6, 0.0];
  renderCube(modelMatrix, viewMatrix, projectionMatrix);

  modelMatrix = popMatrixFromStack(transformStack);

  pushMatrixToStack(transformStack, modelMatrix);
  modelMatrix = mat4.translate(modelMatrix, [0.35, -0.07, -0.2]);
  modelMatrix = mat4.rotate(modelMatrix, (3 * Math.PI) / 4, [1, 1, 1]);
  modelMatrix = mat4.rotate(modelMatrix, -1.45, [0, 0, 1]);
  modelMatrix = mat4.rotate(modelMatrix, 0.6, [0, 1, 0]);
  modelMatrix = mat4.rotate(modelMatrix, 0.1, [1, 0, 0]);
  modelMatrix = mat4.scale(modelMatrix, [0.6, 0.03, 0.3]);

  diffuseColor = [0.18, 0.62, 0];
  renderCube(modelMatrix, viewMatrix, projectionMatrix);

  modelMatrix = popMatrixFromStack(transformStack);

  pushMatrixToStack(transformStack, modelMatrix);
  modelMatrix = mat4.translate(modelMatrix, [-0.35, 0.1, 0.4]);
  modelMatrix = mat4.scale(modelMatrix, [0.3, 0.3, 0.3]);

  diffuseColor = [0.69, 0, 0.69];
  renderSphere(modelMatrix, viewMatrix, projectionMatrix);
  modelMatrix = popMatrixFromStack(transformStack);

  pushMatrixToStack(transformStack, modelMatrix);
  modelMatrix = mat4.translate(modelMatrix, [0.35, 0.1, -0.2]);
  modelMatrix = mat4.scale(modelMatrix, [0.3, 0.3, 0.3]);

  diffuseColor = [0.65, 0.47, 0.12];
  renderSphere(modelMatrix, viewMatrix, projectionMatrix);
  modelMatrix = popMatrixFromStack(transformStack);

  pushMatrixToStack(transformStack, modelMatrix);
  modelMatrix = mat4.translate(modelMatrix, [0.01, 0.265, 0.1]);
  modelMatrix = mat4.rotate(modelMatrix, Math.PI / 4, [1, 1, 1]);
  modelMatrix = mat4.rotate(modelMatrix, -0.6, [0, 0, 1]);
  modelMatrix = mat4.rotate(modelMatrix, 0.12, [0, 1, 0]);
  modelMatrix = mat4.rotate(modelMatrix, -0.25, [1, 0, 0]);
  modelMatrix = mat4.scale(modelMatrix, [1.35, 0.03, 0.25]);

  diffuseColor = [0.93, 0.04, 0.07];
  renderCube(modelMatrix, viewMatrix, projectionMatrix);

  modelMatrix = popMatrixFromStack(transformStack);

  pushMatrixToStack(transformStack, modelMatrix);
  modelMatrix = mat4.translate(modelMatrix, [0, 0.48, 0.1]);
  modelMatrix = mat4.scale(modelMatrix, [0.4, 0.4, 0.4]);

  diffuseColor = [0.54, 0.54, 0.67];
  renderSphere(modelMatrix, viewMatrix, projectionMatrix);
  modelMatrix = popMatrixFromStack(transformStack);
}

function renderAllScenes() {
  viewportHeight = renderCanvas.height;
  viewportWidth = renderCanvas.width / 3;
  gl.enable(gl.SCISSOR_TEST);

  shaderProgram = flatShadingShaderProgram;
  gl.useProgram(shaderProgram);

  gl.viewport(0, 0, viewportWidth, viewportHeight);
  gl.scissor(0, 0, viewportWidth, viewportHeight);

  gl.clearColor(0.85, 0.85, 0.95, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  positionAttributeLocation = gl.getAttribLocation(shaderProgram, "aPosition");
  normalAttributeLocation = gl.getAttribLocation(shaderProgram, "aNormal");
  modelMatrixUniformLocation = gl.getUniformLocation(shaderProgram, "uMMatrix");
  viewMatrixUniformLocation = gl.getUniformLocation(shaderProgram, "uVMatrix");
  projectionMatrixUniformLocation = gl.getUniformLocation(
    shaderProgram,
    "uPMatrix"
  );
  lightPositionUniformLocation = gl.getUniformLocation(
    shaderProgram,
    "uLightPosition"
  );
  ambientColorUniformLocation = gl.getUniformLocation(
    shaderProgram,
    "uAmbientColor"
  );
  diffuseColorUniformLocation = gl.getUniformLocation(
    shaderProgram,
    "uDiffuseColor"
  );
  specularColorUniformLocation = gl.getUniformLocation(
    shaderProgram,
    "uSpecularColor"
  );

  gl.enableVertexAttribArray(positionAttributeLocation);
  gl.enableVertexAttribArray(normalAttributeLocation);

  initializeSphereBuffers();
  initializeCubeBuffers();

  gl.enable(gl.DEPTH_TEST);
  renderFirstScene();

  shaderProgram = gouraudShaderProgram;
  gl.useProgram(shaderProgram);

  gl.viewport(viewportWidth, 0, viewportWidth, viewportHeight);
  gl.scissor(viewportWidth, 0, viewportWidth, viewportHeight);

  gl.clearColor(0.95, 0.85, 0.85, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  positionAttributeLocation = gl.getAttribLocation(shaderProgram, "aPosition");
  normalAttributeLocation = gl.getAttribLocation(shaderProgram, "aNormal");
  modelMatrixUniformLocation = gl.getUniformLocation(shaderProgram, "uMMatrix");
  viewMatrixUniformLocation = gl.getUniformLocation(shaderProgram, "uVMatrix");
  projectionMatrixUniformLocation = gl.getUniformLocation(
    shaderProgram,
    "uPMatrix"
  );
  lightPositionUniformLocation = gl.getUniformLocation(
    shaderProgram,
    "uLightPosition"
  );
  ambientColorUniformLocation = gl.getUniformLocation(
    shaderProgram,
    "uAmbientColor"
  );
  diffuseColorUniformLocation = gl.getUniformLocation(
    shaderProgram,
    "uDiffuseColor"
  );
  specularColorUniformLocation = gl.getUniformLocation(
    shaderProgram,
    "uSpecularColor"
  );

  gl.enableVertexAttribArray(positionAttributeLocation);
  gl.enableVertexAttribArray(normalAttributeLocation);

  initializeSphereBuffers();
  initializeCubeBuffers();

  gl.enable(gl.DEPTH_TEST);
  renderSecondScene();

  shaderProgram = phongShaderProgram;
  gl.useProgram(shaderProgram);

  gl.viewport(2 * viewportWidth, 0, viewportWidth, viewportHeight);
  gl.scissor(2 * viewportWidth, 0, viewportWidth, viewportHeight);

  gl.clearColor(0.85, 0.95, 0.85, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  positionAttributeLocation = gl.getAttribLocation(shaderProgram, "aPosition");
  normalAttributeLocation = gl.getAttribLocation(shaderProgram, "aNormal");
  modelMatrixUniformLocation = gl.getUniformLocation(shaderProgram, "uMMatrix");
  viewMatrixUniformLocation = gl.getUniformLocation(shaderProgram, "uVMatrix");
  projectionMatrixUniformLocation = gl.getUniformLocation(
    shaderProgram,
    "uPMatrix"
  );
  lightPositionUniformLocation = gl.getUniformLocation(
    shaderProgram,
    "uLightPosition"
  );
  ambientColorUniformLocation = gl.getUniformLocation(
    shaderProgram,
    "uAmbientColor"
  );
  diffuseColorUniformLocation = gl.getUniformLocation(
    shaderProgram,
    "uDiffuseColor"
  );
  specularColorUniformLocation = gl.getUniformLocation(
    shaderProgram,
    "uSpecularColor"
  );

  gl.enableVertexAttribArray(positionAttributeLocation);
  gl.enableVertexAttribArray(normalAttributeLocation);

  initializeSphereBuffers();
  initializeCubeBuffers();

  gl.enable(gl.DEPTH_TEST);
  renderThirdScene();
}

function handleMouseDown(event) {
  document.addEventListener("mousemove", handleMouseMove, false);
  document.addEventListener("mouseup", handleMouseUp, false);
  document.addEventListener("mouseout", handleMouseOut, false);

  const canvasRect = renderCanvas.getBoundingClientRect();
  const mouseX = event.clientX - canvasRect.left;
  const mouseY = canvasRect.bottom - event.clientY;

  if (
    mouseX >= 0 &&
    mouseX <= renderCanvas.width &&
    mouseY >= 0 &&
    mouseY <= renderCanvas.height
  ) {
    previousMouseX = mouseX;
    previousMouseY = mouseY;

    const yLim = mouseY <= viewportHeight && mouseY >= 0;
    if (mouseX >= 0 && mouseX <= viewportWidth && yLim) currentScene = 1;
    else if (mouseX >= viewportWidth && mouseX <= viewportWidth * 2 && yLim)
      currentScene = 2;
    else if (mouseX >= viewportWidth * 2 && mouseX <= viewportWidth * 3 && yLim)
      currentScene = 3;
  }
}

function handleMouseMove(event) {
  const canvasRect = renderCanvas.getBoundingClientRect();
  const mouseX = event.clientX - canvasRect.left;
  const mouseY = canvasRect.bottom - event.clientY;

  const diffX1 = mouseX - previousMouseX;
  const diffY2 = mouseY - previousMouseY;

  previousMouseX = mouseX;
  previousMouseY = mouseY;

  const yLim = mouseY <= viewportHeight && mouseY >= 0;
  if (mouseX >= 0 && mouseX <= viewportWidth && yLim && currentScene == 1) {
    firstSceneRotationX = firstSceneRotationX + diffX1 / 5;
    firstSceneRotationY = firstSceneRotationY - diffY2 / 5;
  } else if (
    mouseX >= viewportWidth &&
    mouseX <= viewportWidth * 2 &&
    yLim &&
    currentScene == 2
  ) {
    secondSceneRotationX = secondSceneRotationX + diffX1 / 5;
    secondSceneRotationY = secondSceneRotationY - diffY2 / 5;
  } else if (
    mouseX >= viewportWidth * 2 &&
    mouseX <= viewportWidth * 3 &&
    yLim &&
    currentScene == 3
  ) {
    thirdSceneRotationX = thirdSceneRotationX + diffX1 / 5;
    thirdSceneRotationY = thirdSceneRotationY - diffY2 / 5;
  }
  renderAllScenes();
}

function handleMouseUp(event) {
  document.removeEventListener("mousemove", handleMouseMove, false);
  document.removeEventListener("mouseup", handleMouseUp, false);
  document.removeEventListener("mouseout", handleMouseOut, false);
}

function handleMouseOut(event) {
  document.removeEventListener("mousemove", handleMouseMove, false);
  document.removeEventListener("mouseup", handleMouseUp, false);
  document.removeEventListener("mouseout", handleMouseOut, false);
}

function initializeApplication() {
  renderCanvas = document.getElementById("webglCanvas");
  document.addEventListener("mousedown", handleMouseDown, false);

  const lightPositionSlider = document.getElementById("lightPositionSlider");
  let lightX = parseFloat(lightPositionSlider.value);

  lightPositionSlider.addEventListener("input", (event) => {
    lightX = parseFloat(event.target.value);
    lightPosition = [lightX, 3.0, 4.0];
    renderAllScenes();
  });

  const cameraZoomSlider = document.getElementById("cameraZoomSlider");
  let cameraZ = parseFloat(cameraZoomSlider.value);

  cameraZoomSlider.addEventListener("input", (event) => {
    cameraZ = parseFloat(event.target.value);
    cameraPosition = [0.0, 0.0, cameraZ];
    renderAllScenes();
  });

  initializeWebGL(renderCanvas);

  flatShadingShaderProgram = createShaderProgram(
    flatShadingVertexShader,
    flatShadingFragmentShader
  );
  gouraudShaderProgram = createShaderProgram(
    gouraudVertexShader,
    gouraudFragmentShader
  );
  phongShaderProgram = createShaderProgram(
    phongVertexShader,
    phongFragmentShader
  );

  renderAllScenes();
}
