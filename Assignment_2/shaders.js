/////////////////////////////////////
// Flat Shading

// Vertex shader code
const flatVertexShaderCode = `#version 300 es
in vec3 aPosition;
in vec3 aNormal;
uniform mat4 uMMatrix;
uniform mat4 uPMatrix;
uniform mat4 uVMatrix;

out mat4 viewMatrix;
out vec3 vPosEyeSpace;

void main() {
    mat4 projectionModelView;
    projectionModelView = uPMatrix * uVMatrix * uMMatrix;
    gl_Position = projectionModelView * vec4(aPosition, 1.0);
    viewMatrix = uVMatrix;
    vPosEyeSpace = (uVMatrix * uMMatrix * vec4(aPosition, 1.0)).xyz;
}`;

// Fragment shader code
const flatFragShaderCode = `#version 300 es
precision mediump float;
in vec3 vPosEyeSpace;
uniform vec3 uLightPosition;
uniform vec3 uAmbientColor;
uniform vec3 uDiffuseColor;
uniform vec3 uSpecularColor;
in mat4 viewMatrix;

out vec4 fragColor;

void main() {
    // Compute face normal and normalize it
    vec3 normal = normalize(cross(dFdx(vPosEyeSpace), dFdy(vPosEyeSpace)));

    // Compute light vector and normalize
    vec3 lightVector = normalize(uLightPosition - vPosEyeSpace);

    // Compute reflection vector and normalize
    vec3 reflectionVector = normalize(-reflect(lightVector, normal));

    // Compute view vector to camera and normalize
    vec3 viewVector = normalize(-vPosEyeSpace);

    // Calculate Phong shading ligting
    float ambient = 0.15;
    float diffuse = max(dot(lightVector, normal), 0.0);
    float specular = pow(max(dot(reflectionVector, viewVector), 0.0), 32.0);

    // Combine the terms to get the final colour
    vec3 light_color = uAmbientColor * ambient + uDiffuseColor * diffuse + uSpecularColor * specular;


    fragColor = vec4(light_color, 1.0);
}`;

/////////////////////////////////////
// Gouraud Shading

// Vertex shader code
const perVertVertexShaderCode = `#version 300 es
in vec3 aPosition;
in vec3 aNormal;
uniform mat4 uMMatrix;
uniform mat4 uPMatrix;
uniform mat4 uVMatrix;

out vec3 fColor;

uniform vec3 uLightPosition;
uniform vec3 uAmbientColor;
uniform vec3 uDiffuseColor;
uniform vec3 uSpecularColor;

void main() {
    // Transform vertex position to eye space
    vec3 posEyeSpace = (uVMatrix * uMMatrix * vec4(aPosition, 1.0)).xyz;

    // Transform vertex normal and normalize
    vec3 normalEyeSpace = normalize((transpose(inverse(mat3(uVMatrix * uMMatrix)))) * aNormal);

    // Compute light vector and normalize
    vec3 L = normalize(uLightPosition - posEyeSpace);

    vec3 V = normalize(-posEyeSpace);

    // Compute Phong shading
    float diffuse = max(dot(normalEyeSpace, L), 0.0);
    float specular = pow(max(dot(-reflect(L, normalEyeSpace), V), 0.0), 32.0);
    float ambient = 0.15;
    fColor = uAmbientColor * ambient + uDiffuseColor * diffuse + uSpecularColor * specular;

    // Calculate final vertex position in clip space
    gl_Position = uPMatrix * uVMatrix * uMMatrix * vec4(aPosition, 1.0);
}`;

// Fragment shader code
const perVertFragShaderCode = `#version 300 es
precision mediump float;
in vec3 fColor;
out vec4 fragColor;

void main() {
    fragColor = vec4(fColor, 1.0);
}`;

/////////////////////////////////////
// Phong Shading

// Vertex shader code
const perFragVertexShaderCode = `#version 300 es
in vec3 aPosition;
in vec3 aNormal;
uniform mat4 uMMatrix;
uniform mat4 uPMatrix;
uniform mat4 uVMatrix;

out vec3 vPosEyeSpace;
out vec3 normalEyeSpace;

out vec3 L;
out vec3 V;

uniform vec3 uLightPosition;

void main() {
    // Transform vertex position to eye space
    vPosEyeSpace = (uVMatrix * uMMatrix * vec4(aPosition, 1.0)).xyz;

    // Transform vertex normal and normalize
    normalEyeSpace = normalize(mat3(uVMatrix * uMMatrix) * aNormal);

    // Compute light vector and normalize
    L = normalize(uLightPosition - vPosEyeSpace);

    V = normalize(-vPosEyeSpace);

    // Calculate final vertex position in clip space
    gl_Position = uPMatrix * uVMatrix * uMMatrix * vec4(aPosition, 1.0);
}`;

// Fragment shader code
const perFragFragShaderCode = `#version 300 es
precision mediump float;
out vec4 fragColor;

in vec3 normalEyeSpace;
in vec3 L;
in vec3 V;
in vec3 vPosEyeSpace;

uniform vec3 uAmbientColor;
uniform vec3 uDiffuseColor;
uniform vec3 uSpecularColor;

void main() {

    vec3 normal = normalEyeSpace;
    vec3 lightVector = L;
    vec3 viewVector = V;

    // Calculate reflection direction
    vec3 reflectionVector = normalize(-reflect(lightVector, normal));

    // Compute Phong shading
    float diffuse = max(dot(normal, lightVector), 0.0);
    float specular = pow(max(dot(reflectionVector, viewVector), 0.0), 32.0);
    float ambient = 0.15;
    vec3 fColor = uAmbientColor * ambient + uDiffuseColor * diffuse + uSpecularColor * specular;
    fragColor = vec4(fColor, 1.0);
}`;

function vertexShaderSetup(vertexShaderCode) {
  shader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(shader, vertexShaderCode);
  gl.compileShader(shader);
  // Error check whether the shader is compiled correctly
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
  // Error check whether the shader is compiled correctly
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert(gl.getShaderInfoLog(shader));
    return null;
  }
  return shader;
}

function initShaders(vertexShaderCode, fragShaderCode) {
  shaderProgram = gl.createProgram();

  var vertexShader = vertexShaderSetup(vertexShaderCode);
  var fragmentShader = fragmentShaderSetup(fragShaderCode);

  // attach the shaders
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  //link the shader program
  gl.linkProgram(shaderProgram);

  // check for compilation and linking status
  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    console.log(gl.getShaderInfoLog(vertexShader));
    console.log(gl.getShaderInfoLog(fragmentShader));
  }

  //finally use the program.
  gl.useProgram(shaderProgram);

  return shaderProgram;
}
