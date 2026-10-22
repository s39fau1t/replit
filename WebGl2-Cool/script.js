const canvas = document.getElementById("gl-canvas");
const gl = canvas.getContext("webgl2");

const vShaderSource = `#version 300 es

precision highp float;

in vec2 a_position;
in vec3 a_color;

out vec3 v_color;

uniform vec2 u_resolution;

void main() {
  v_color = a_color;

  vec2 zeroToOne = a_position / u_resolution;
  vec2 zeroToTwo = zeroToOne * 2.0;
  vec2 clipSpace = zeroToTwo - 1.0;

  gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
}
`;
const fShaderSource = `#version 300 es

precision highp float;

in vec3 v_color;

out vec4 outColor;

void main() {
  outColor = vec4(v_color, 1);
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
const resUniformLoc = gl.getUniformLocation(program, "u_resolution");

const vertexArray = gl.createVertexArray();

gl.bindVertexArray(vertexArray);

const posBuffer = gl.createBuffer();

gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);

canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;

gl.viewport(0, 0, canvas.width, canvas.height);

const positions = [
  0, 0,
  canvas.width, 0,
  0, canvas.height,
  0, canvas.height,
  canvas.width, canvas.height,
  canvas.width, 0
];

gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

gl.enableVertexAttribArray(posAttribLoc);

gl.vertexAttribPointer(posAttribLoc, 2, gl.FLOAT, false, 0, 0);

const colorBuffer = gl.createBuffer();

gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);

setColors();

gl.enableVertexAttribArray(colorAttribLoc);

gl.vertexAttribPointer(colorAttribLoc, 3, gl.FLOAT, false, 0, 0);

gl.clearColor(1, 1, 1, 1);
gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

gl.useProgram(program);

gl.uniform2f(resUniformLoc, canvas.width, canvas.height);

gl.bindVertexArray(vertexArray);

gl.drawArrays(gl.TRIANGLES, 0, positions.length / 2);

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