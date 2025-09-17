var cubeVertexBuffer;
var cubeIndexBuffer;
var cubeNormalBuffer;

function initializeCubeBuffers() {
  const vertices = [
    // Front face
    -0.5, -0.5, 0.5, 0.5, -0.5, 0.5, 0.5, 0.5, 0.5, -0.5, 0.5, 0.5,
    // Back face
    -0.5, -0.5, -0.5, 0.5, -0.5, -0.5, 0.5, 0.5, -0.5, -0.5, 0.5, -0.5,
    // Top face
    -0.5, 0.5, -0.5, 0.5, 0.5, -0.5, 0.5, 0.5, 0.5, -0.5, 0.5, 0.5,
    // Bottom face
    -0.5, -0.5, -0.5, 0.5, -0.5, -0.5, 0.5, -0.5, 0.5, -0.5, -0.5, 0.5,
    // Right face
    0.5, -0.5, -0.5, 0.5, 0.5, -0.5, 0.5, 0.5, 0.5, 0.5, -0.5, 0.5,
    // Left face
    -0.5, -0.5, -0.5, -0.5, 0.5, -0.5, -0.5, 0.5, 0.5, -0.5, -0.5, 0.5,
  ];
  cubeVertexBuffer = webGLContext.createBuffer();
  webGLContext.bindBuffer(webGLContext.ARRAY_BUFFER, cubeVertexBuffer);
  webGLContext.bufferData(
    webGLContext.ARRAY_BUFFER,
    new Float32Array(vertices),
    webGLContext.STATIC_DRAW
  );
  cubeVertexBuffer.itemSize = 3;
  cubeVertexBuffer.numItems = vertices.length / 3;

  const normals = [
    // Front face
    0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0,
    // Back face
    0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0,
    // Top face
    0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0,
    // Bottom face
    0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0,
    // Right face
    1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0,
    // Left face
    -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0,
  ];
  cubeNormalBuffer = webGLContext.createBuffer();
  webGLContext.bindBuffer(webGLContext.ARRAY_BUFFER, cubeNormalBuffer);
  webGLContext.bufferData(
    webGLContext.ARRAY_BUFFER,
    new Float32Array(normals),
    webGLContext.STATIC_DRAW
  );
  cubeNormalBuffer.itemSize = 3;
  cubeNormalBuffer.numItems = normals.length / 3;

  const indices = [
    0,
    1,
    2,
    0,
    2,
    3, // Front face
    4,
    5,
    6,
    4,
    6,
    7, // Back face
    8,
    9,
    10,
    8,
    10,
    11, // Top face
    12,
    13,
    14,
    12,
    14,
    15, // Bottom face
    16,
    17,
    18,
    16,
    18,
    19, // Right face
    20,
    21,
    22,
    20,
    22,
    23, // Left face
  ];
  cubeIndexBuffer = webGLContext.createBuffer();
  webGLContext.bindBuffer(webGLContext.ELEMENT_ARRAY_BUFFER, cubeIndexBuffer);
  webGLContext.bufferData(
    webGLContext.ELEMENT_ARRAY_BUFFER,
    new Uint16Array(indices),
    webGLContext.STATIC_DRAW
  );
  cubeIndexBuffer.itemSize = 1;
  cubeIndexBuffer.numItems = indices.length;
}

function renderCube(modelMatrix, viewMatrix, projectionMatrix) {
  webGLContext.bindBuffer(webGLContext.ARRAY_BUFFER, cubeVertexBuffer);
  webGLContext.vertexAttribPointer(
    positionAttributeLocation,
    cubeVertexBuffer.itemSize,
    webGLContext.FLOAT,
    false,
    0,
    0
  );

  webGLContext.bindBuffer(webGLContext.ARRAY_BUFFER, cubeNormalBuffer);
  webGLContext.vertexAttribPointer(
    normalAttributeLocation,
    cubeNormalBuffer.itemSize,
    webGLContext.FLOAT,
    false,
    0,
    0
  );

  webGLContext.bindBuffer(webGLContext.ELEMENT_ARRAY_BUFFER, cubeIndexBuffer);

  webGLContext.uniformMatrix4fv(modelMatrixUniformLocation, false, modelMatrix);
  webGLContext.uniformMatrix4fv(viewMatrixUniformLocation, false, viewMatrix);
  webGLContext.uniformMatrix4fv(
    projectionMatrixUniformLocation,
    false,
    projectionMatrix
  );
  webGLContext.uniform3fv(lightPositionUniformLocation, lightPosition);
  webGLContext.uniform3fv(ambientColorUniformLocation, ambientColor);
  webGLContext.uniform3fv(diffuseColorUniformLocation, diffuseColor);
  webGLContext.uniform3fv(specularColorUniformLocation, specularColor);

  webGLContext.drawElements(
    webGLContext.TRIANGLES,
    cubeIndexBuffer.numItems,
    webGLContext.UNSIGNED_SHORT,
    0
  );
}
