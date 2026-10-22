const canvas = document.getElementById("gl-canvas");
const gl = canvas.getContext("webgl2");

const xSlider = document.getElementById("x-slider"), ySlider = document.getElementById("y-slider"), rotationSlider = document.getElementById("rotation-slider"), scaleXSlider = document.getElementById("scale-x-slider"), scaleYSlider = document.getElementById("scale-y-slider");

xSlider.max = canvas.clientWidth - 100;
ySlider.max = canvas.clientHeight - 100;

const vShaderSource = `#version 300 es

precision highp float;

in vec2 a_position;
in vec4 a_color;

out vec4 v_color;

uniform mat3 u_matrix;

void main() {
  v_color = a_color;

  gl_Position = vec4((u_matrix * vec3(a_position, 1)).xy, 0, 1);
}
`;
const fShaderSource = `#version 300 es

precision highp float;

in vec4 v_color;

out vec4 outColor;

void main() {
  outColor = v_color;
}
`;

const program = gl.createProgram();

const vertexShader = gl.createShader(gl.VERTEX_SHADER);
const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

gl.shaderSource(vertexShader, vShaderSource);
gl.shaderSource(fragmentShader, fShaderSource);

gl.compileShader(vertexShader);
gl.compileShader(fragmentShader);

gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);

gl.linkProgram(program);

const posAttribLoc = gl.getAttribLocation(program, "a_position");
const colorAttribLoc = gl.getAttribLocation(program, "a_color");

const matrixUniformLoc = gl.getUniformLocation(program, "u_matrix");

const vertexArray = gl.createVertexArray();

gl.bindVertexArray(vertexArray);

const posBuffer = gl.createBuffer();

gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);

const positions = [
  0, 0,
  100, 0,
  0, 100,
  0, 100,
  100, 100,
  100, 0
];

gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

gl.enableVertexAttribArray(posAttribLoc);

gl.vertexAttribPointer(posAttribLoc, 2, gl.FLOAT, false, 0, 0);

const colorBuffer = gl.createBuffer();

gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);

setColors();

gl.enableVertexAttribArray(colorAttribLoc);

gl.vertexAttribPointer(colorAttribLoc, 3, gl.FLOAT, false, 0, 0);

canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;

function main() {
  gl.viewport(0, 0, canvas.width, canvas.height);

  gl.clearColor(1, 1, 1, 1);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  gl.useProgram(program);

  gl.bindVertexArray(vertexArray);

  const angleRadians = Math.PI / 180 * rotationSlider.value;

  const projection = m3.projection(canvas.width, canvas.height);
  const translation = m3.translation(xSlider.value, ySlider.value);
  const rotation = m3.rotation(angleRadians);
  const scale = m3.scaling(scaleXSlider.value, scaleYSlider.value);

  const matrix = m3.multiply(projection, translation, rotation, scale);

  gl.uniformMatrix3fv(matrixUniformLoc, false, matrix);

  gl.drawArrays(gl.TRIANGLES, 0, positions.length / 2);
};

function setColors() {
  const rgb1 = [Math.random(), Math.random(), Math.random()];
  const rgb2 = [Math.random(), Math.random(), Math.random()];
  const rgb3 = [Math.random(), Math.random(), Math.random()];
  const rgb4 = [Math.random(), Math.random(), Math.random()];

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    rgb1[0], rgb1[1], rgb1[2],
    rgb2[0], rgb2[1], rgb2[2],
    rgb3[0], rgb3[1], rgb3[2],
    rgb3[0], rgb3[1], rgb3[2],
    rgb4[0], rgb4[1], rgb4[2],
    rgb2[0], rgb2[1], rgb2[2]
  ]), gl.STATIC_DRAW);
};

main();

xSlider.oninput = main;

ySlider.oninput = main;

rotationSlider.oninput = main;

scaleXSlider.oninput = main;

scaleYSlider.oninput = main;