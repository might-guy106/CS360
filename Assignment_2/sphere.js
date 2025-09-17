var sphereVertexBuffer;
var sphereIndexBuffer;
var sphereNormalBuffer;
var sphereVertices = [];
var sphereIndices = [];
var sphereNormals = [];

function generateSphereGeometry(sliceCount, stackCount, radius) {
  let theta1, theta2;

  for (let i = 0; i < sliceCount; i++) {
    sphereVertices.push(0);
    sphereVertices.push(-radius);
    sphereVertices.push(0);

    sphereNormals.push(0);
    sphereNormals.push(-1.0);
    sphereNormals.push(0);
  }

  for (let j = 1; j < stackCount - 1; j++) {
    theta1 = (j * 2 * Math.PI) / sliceCount - Math.PI / 2;
    for (let i = 0; i < sliceCount; i++) {
      theta2 = (i * 2 * Math.PI) / sliceCount;
      sphereVertices.push(radius * Math.cos(theta1) * Math.cos(theta2));
      sphereVertices.push(radius * Math.sin(theta1));
      sphereVertices.push(radius * Math.cos(theta1) * Math.sin(theta2));

      sphereNormals.push(Math.cos(theta1) * Math.cos(theta2));
      sphereNormals.push(Math.sin(theta1));
      sphereNormals.push(Math.cos(theta1) * Math.sin(theta2));
    }
  }

  for (let i = 0; i < sliceCount; i++) {
    sphereVertices.push(0);
    sphereVertices.push(radius);
    sphereVertices.push(0);

    sphereNormals.push(0);
    sphereNormals.push(1.0);
    sphereNormals.push(0);
  }

  for (let j = 0; j < stackCount - 1; j++) {
    for (let i = 0; i <= sliceCount; i++) {
      const mi = i % sliceCount;
      const mi2 = (i + 1) % sliceCount;
      const idx = (j + 1) * sliceCount + mi;
      const idx2 = j * sliceCount + mi;
      const idx3 = j * sliceCount + mi2;
      const idx4 = (j + 1) * sliceCount + mi;
      const idx5 = j * sliceCount + mi2;
      const idx6 = (j + 1) * sliceCount + mi2;

      sphereIndices.push(idx);
      sphereIndices.push(idx2);
      sphereIndices.push(idx3);
      sphereIndices.push(idx4);
      sphereIndices.push(idx5);
      sphereIndices.push(idx6);
    }
  }
}

function initializeSphereBuffers() {
  const sliceCount = 30;
  const stackCount = sliceCount / 2 + 1;
  const radius = 0.5;
  generateSphereGeometry(sliceCount, stackCount, radius);

  sphereVertexBuffer = webGLContext.createBuffer();
  webGLContext.bindBuffer(webGLContext.ARRAY_BUFFER, sphereVertexBuffer);
  webGLContext.bufferData(
    webGLContext.ARRAY_BUFFER,
    new Float32Array(sphereVertices),
    webGLContext.STATIC_DRAW
  );
  sphereVertexBuffer.itemSize = 3;
  sphereVertexBuffer.numItems = sliceCount * stackCount;

  sphereNormalBuffer = webGLContext.createBuffer();
  webGLContext.bindBuffer(webGLContext.ARRAY_BUFFER, sphereNormalBuffer);
  webGLContext.bufferData(
    webGLContext.ARRAY_BUFFER,
    new Float32Array(sphereNormals),
    webGLContext.STATIC_DRAW
  );
  sphereNormalBuffer.itemSize = 3;
  sphereNormalBuffer.numItems = sliceCount * stackCount;

  sphereIndexBuffer = webGLContext.createBuffer();
  webGLContext.bindBuffer(webGLContext.ELEMENT_ARRAY_BUFFER, sphereIndexBuffer);
  webGLContext.bufferData(
    webGLContext.ELEMENT_ARRAY_BUFFER,
    new Uint32Array(sphereIndices),
    webGLContext.STATIC_DRAW
  );
  sphereIndexBuffer.itemsize = 1;
  sphereIndexBuffer.numItems = (stackCount - 1) * 6 * (sliceCount + 1);
}

function renderSphere(modelMatrix, viewMatrix, projectionMatrix) {
  webGLContext.bindBuffer(webGLContext.ARRAY_BUFFER, sphereVertexBuffer);
  webGLContext.vertexAttribPointer(
    positionAttributeLocation,
    sphereVertexBuffer.itemSize,
    webGLContext.FLOAT,
    false,
    0,
    0
  );

  webGLContext.bindBuffer(webGLContext.ARRAY_BUFFER, sphereNormalBuffer);
  webGLContext.vertexAttribPointer(
    normalAttributeLocation,
    sphereNormalBuffer.itemSize,
    webGLContext.FLOAT,
    false,
    0,
    0
  );

  webGLContext.bindBuffer(webGLContext.ELEMENT_ARRAY_BUFFER, sphereIndexBuffer);

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
    sphereIndexBuffer.numItems,
    webGLContext.UNSIGNED_INT,
    0
  );
}
