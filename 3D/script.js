const canvas = document.getElementById("gl-canvas");
const gl = canvas.getContext("webgl2");

const xSlider = document.getElementById("x-slider"), ySlider = document.getElementById("y-slider"), zSlider = document.getElementById("z-slider"), rotationXSlider = document.getElementById("rotation-x-slider"), rotationYSlider = document.getElementById("rotation-y-slider"), rotationZSlider = document.getElementById("rotation-z-slider"), scaleXSlider = document.getElementById("scale-x-slider"), scaleYSlider = document.getElementById("scale-y-slider"), scaleZSlider = document.getElementById("scale-z-slider");

xSlider.min = -canvas.clientWidth / 2 - 100;
ySlider.min = -canvas.clientHeight / 2 - 100;
xSlider.max = canvas.clientWidth / 2 - 100;
ySlider.max = canvas.clientHeight / 2 - 100;

const vShaderSource = `#version 300 es

precision highp float;

in vec4 a_position;

in vec4 a_color;

out vec4 v_color;

uniform mat4 u_matrix;

void main() {
  v_color = a_color;

  gl_Position = u_matrix * a_position;
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
  //Front
  0, 0, 0,
  0, 100, 0,
  100, 0, 0,
  100, 0, 0,
  0, 100, 0,
  100, 100, 0,
  //Back
  0, 0, 30,
  100, 0, 30,
  0, 100, 30,
  100, 0, 30,
  100, 100, 30,
  0, 100, 30,
  //Left
  0, 0, 30,
  0, 100, 30,
  0, 0, 0,
  0, 0, 0,
  0, 100, 30,
  0, 100, 0,
  //Right
  100, 0, 30,
  100, 0, 0,
  100, 100, 30,
  100, 0, 0,
  100, 100, 0,
  100, 100, 30,
  //Top WIP
  100, 0, 30,
  0, 0, 30,
  100, 0, 0,
  100, 0, 0,
  0, 0, 30,
  0, 0, 0,
  //Bottom WIP
  100, 100, 30,
  100, 100, 0,
  0, 100, 30,
  100, 100, 0,
  0, 100, 0,
  0, 100, 30
];

gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

gl.enableVertexAttribArray(posAttribLoc);

gl.vertexAttribPointer(posAttribLoc, 3, gl.FLOAT, false, 0, 0);

const colorBuffer = gl.createBuffer();

gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);

setColors(positions.length / 16);

gl.enableVertexAttribArray(colorAttribLoc);

gl.vertexAttribPointer(colorAttribLoc, 3, gl.FLOAT, false, 0, 0);

canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;

function main() {
  gl.enable(gl.DEPTH_TEST);

  gl.enable(gl.CULL_FACE);

  gl.viewport(0, 0, canvas.width, canvas.height);

  gl.clearColor(1, 1, 1, 1);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  gl.useProgram(program);

  gl.bindVertexArray(vertexArray);

  const xAngleRadians = Math.PI / 180 * rotationXSlider.value;
  const yAngleRadians = Math.PI / 180 * rotationYSlider.value;
  const zAngleRadians = Math.PI / 180 * rotationZSlider.value;

  const perspective = m4.perspective(Math.PI / 180 * 60, canvas.width / canvas.height, 1, 10000);
  const translation = m4.translation(xSlider.value, ySlider.value, zSlider.value - 660);
  const xRotation = m4.xRotation(xAngleRadians);
  const yRotation = m4.yRotation(yAngleRadians);
  const zRotation = m4.zRotation(zAngleRadians);
  const scale = m4.scaling(scaleXSlider.value, scaleYSlider.value, scaleZSlider.value);

  const matrix = m4.multiply(perspective, translation, xRotation, yRotation, zRotation, scale);

  gl.uniformMatrix4fv(matrixUniformLoc, false, matrix);

  gl.drawArrays(gl.TRIANGLES, 0, positions.length / 3);
};

function setColors(numRects) {
  let colors = [];
  for(let i = 0; i < numRects; i ++) {
    const back = i % 2;

    const rgb1 = [Math.random(), Math.random(), Math.random()];
    const rgb2 = [Math.random(), Math.random(), Math.random()];
    const rgb3 = [Math.random(), Math.random(), Math.random()];
    const rgb4 = [Math.random(), Math.random(), Math.random()];

    if(!back) {
      colors.push(
        rgb1[0], rgb1[1], rgb1[2],
        rgb2[0], rgb2[1], rgb2[2],
        rgb3[0], rgb3[1], rgb3[2],
        rgb3[0], rgb3[1], rgb3[2],
        rgb2[0], rgb2[1], rgb2[2],
        rgb4[0], rgb4[1], rgb4[2]
      );
    }else {
      colors.push(
        rgb1[0], rgb1[1], rgb1[2],
        rgb2[0], rgb2[1], rgb2[2],
        rgb3[0], rgb3[1], rgb3[2],
        rgb2[0], rgb2[1], rgb2[2],
        rgb4[0], rgb4[1], rgb4[2],
        rgb3[0], rgb3[1], rgb3[2]
      );
    }
  }

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
};

main();

xSlider.oninput = main;

ySlider.oninput = main;

zSlider.oninput = main;

rotationXSlider.oninput = main;

rotationYSlider.oninput = main;

rotationZSlider.oninput = main;

scaleXSlider.oninput = main;

scaleYSlider.oninput = main;

scaleZSlider.oninput = main;