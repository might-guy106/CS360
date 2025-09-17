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

  sphereVertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array(sphereVertices),
    gl.STATIC_DRAW
  );
  sphereVertexBuffer.itemSize = 3;
  sphereVertexBuffer.numItems = sliceCount * stackCount;

  sphereNormalBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, sphereNormalBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array(sphereNormals),
    gl.STATIC_DRAW
  );
  sphereNormalBuffer.itemSize = 3;
  sphereNormalBuffer.numItems = sliceCount * stackCount;

  sphereIndexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sphereIndexBuffer);
  gl.bufferData(
    gl.ELEMENT_ARRAY_BUFFER,
    new Uint32Array(sphereIndices),
    gl.STATIC_DRAW
  );
  sphereIndexBuffer.itemsize = 1;
  sphereIndexBuffer.numItems = (stackCount - 1) * 6 * (sliceCount + 1);
}

function renderSphere(modelMatrix, viewMatrix, projectionMatrix) {
  gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexBuffer);
  gl.vertexAttribPointer(
    positionAttributeLocation,
    sphereVertexBuffer.itemSize,
    gl.FLOAT,
    false,
    0,
    0
  );

  gl.bindBuffer(gl.ARRAY_BUFFER, sphereNormalBuffer);
  gl.vertexAttribPointer(
    normalAttributeLocation,
    sphereNormalBuffer.itemSize,
    gl.FLOAT,
    false,
    0,
    0
  );

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sphereIndexBuffer);

  gl.uniformMatrix4fv(modelMatrixUniformLocation, false, modelMatrix);
  gl.uniformMatrix4fv(viewMatrixUniformLocation, false, viewMatrix);
  gl.uniformMatrix4fv(projectionMatrixUniformLocation, false, projectionMatrix);
  gl.uniform3fv(lightPositionUniformLocation, lightPosition);
  gl.uniform3fv(ambientColorUniformLocation, ambientColor);
  gl.uniform3fv(diffuseColorUniformLocation, diffuseColor);
  gl.uniform3fv(specularColorUniformLocation, specularColor);

  gl.drawElements(gl.TRIANGLES, sphereIndexBuffer.numItems, gl.UNSIGNED_INT, 0);
}
