const canvas = document.getElementById("gl-canvas");

const select = document.getElementById("kernel-select");

//From https://en.wikipedia.org/wiki/Kernel_(image_processing) and https://docs.gimp.org/2.6/en/plug-in-convmatrix.html

const kernels = {
  normal: [
    0, 0, 0,
    0, 1, 0,
    0, 0, 0
  ],
  edgeDetect1: [
    1, 0, -1,
    0, 0, 0,
    -1, 0, 1
  ],
  edgeDetect2: [
    0, -1, 0,
    -1, 4, -1,
    0, -1, 0
  ],
  edgeDetect3: [
    -1, -1, -1,
    -1, 8, -1,
    -1, -1, -1
  ],
  sharpen: [
    0, -1, 0,
    -1, 5, -1,
    0, -1, 0
  ],
  boxBlur: [
    1/9, 1/9, 1/9,
    1/9, 1/9, 1/9,
    1/9, 1/9, 1/9
  ],
  emboss: [
    -2, -1, 0,
    -1, 1, 1,
    0, 1, 2
  ]
};

const table = document.createElement("table"), tbody = document.createElement("tbody");

for(let i in kernels) {
  if(i !== "normal") {
    let tr = document.createElement("tr"), td = document.createElement("td");

    const check = document.createElement("input");

    check.type = "checkbox";

    check.value = i;

    check.oninput = () => {
      loadImage();
    };

    td.appendChild(check);
    td.appendChild(document.createTextNode(i));
    tr.appendChild(td);
    tbody.appendChild(tr);
  }
}

table.appendChild(tbody);

select.appendChild(table);

function loadImage() {
  const image = new Image(canvas.clientWidth, canvas.clientHeight);
  image.src = "chicken.jpeg";
  image.onload = function() {
    main(image);
  };
};

function main(image) {
  const gl = canvas.getContext("webgl2");

  const vShaderSource = `#version 300 es

  precision highp float;

  uniform vec2 u_resolution;
  uniform float u_flipY;

  in vec2 a_position;
  in vec2 a_texCoord;

  out vec2 v_texCoord;

  void main() {
    v_texCoord = a_texCoord;

    vec2 zeroToOne = a_position / u_resolution;
    vec2 zeroToTwo = zeroToOne * 2.0;
    vec2 clipSpace = zeroToTwo - 1.0;

    gl_Position = vec4(clipSpace * vec2(1, u_flipY), 0, 1);
  }
  `;

  const fShaderSource = `#version 300 es

  precision highp float;

  uniform sampler2D u_image;

  uniform float u_kernel[9];
  uniform float u_kernelWeight;

  in vec2 v_texCoord;

  out vec4 outColor;

  void main() {
    vec2 onePixel = vec2(1, 1) / vec2(textureSize(u_image, 0));

    outColor = vec4(
    ((texture(u_image, v_texCoord + vec2(-onePixel.x, onePixel.y)) * u_kernel[0] +
    texture(u_image, v_texCoord + vec2(0, onePixel.y)) * u_kernel[1] +
    texture(u_image, v_texCoord + onePixel) * u_kernel[2] +
    texture(u_image, v_texCoord + vec2(-onePixel.x, 0)) * u_kernel[3] +
    texture(u_image, v_texCoord) * u_kernel[4] +
    texture(u_image, v_texCoord + vec2(onePixel.x, 0)) * u_kernel[5] +
    texture(u_image, v_texCoord + -onePixel) * u_kernel[6] +
    texture(u_image, v_texCoord + vec2(0, -onePixel.y)) * u_kernel[7] +
    texture(u_image, v_texCoord + vec2(onePixel.x, -onePixel.y)) * u_kernel[8]) / u_kernelWeight).rgb, 1)
    ;
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
  const texCoordAttribLoc = gl.getAttribLocation(program, "a_texCoord");
  const resUniformLoc = gl.getUniformLocation(program, "u_resolution");
  const imageUniformLoc = gl.getUniformLocation(program, "u_image");
  const kernelUniformLoc = gl.getUniformLocation(program, "u_kernel");
  const kernelWeightUniformLoc = gl.getUniformLocation(program, "u_kernelWeight");
  const flipYUniformLoc = gl.getUniformLocation(program, "u_flipY");

  const vertexArray = gl.createVertexArray();

  gl.bindVertexArray(vertexArray);

  const positionBuffer = gl.createBuffer();

  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  const positions = [
    0, 0,
    image.width, 0,
    0, image.height,
    image.width, 0,
    0, image.height,
    image.width, image.height
  ];

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  gl.enableVertexAttribArray(posAttribLoc);

  gl.vertexAttribPointer(posAttribLoc, 2, gl.FLOAT, false, 0, 0);

  const texCoordBuffer = gl.createBuffer();

  gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);

  const texCoords = [
    0.0, 0.0,
    1.0, 0.0,
    0.0, 1.0,
    1.0, 0.0,
    0.0, 1.0,
    1.0, 1.0
  ];

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW);

  gl.enableVertexAttribArray(texCoordAttribLoc);

  gl.vertexAttribPointer(texCoordAttribLoc, 2, gl.FLOAT, false, 0, 0);

  const originalTexture = createTexture(gl);

  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

  let textures = [], framebuffers = [];

  for(let i = 0; i < 2; i ++) {
    const texture = createTexture(gl);
    textures.push(texture);

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, image.width, image.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

    const framebuffer = gl.createFramebuffer();
    framebuffers.push(framebuffer);
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);

    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
  }

  gl.clearColor(1, 1, 1, 1);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  gl.useProgram(program);

  gl.bindVertexArray(vertexArray);

  gl.activeTexture(gl.TEXTURE0);

  gl.bindTexture(gl.TEXTURE_2D, originalTexture);

  gl.uniform1i(imageUniformLoc, 0);

  gl.uniform1f(flipYUniformLoc, 1);

  let count = 0;
  for(let row of tbody.rows) {
    const check = row.firstChild.firstChild;

    if(check.checked) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffers[count % 2]);

      gl.uniform2f(resUniformLoc, image.width, image.height);

      gl.viewport(0, 0, image.width, image.height);

      gl.uniform1fv(kernelUniformLoc, kernels[check.value]);

      gl.uniform1f(kernelWeightUniformLoc, Math.max(kernels[check.value].reduce((previousValue, currentValue) => previousValue + currentValue), 1));

      gl.drawArrays(gl.TRIANGLES, 0, 6);

      gl.bindTexture(gl.TEXTURE_2D, textures[count % 2]);

      count ++;
    }
  }

  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;

  gl.uniform1fv(kernelUniformLoc, kernels.normal);

  gl.uniform1f(kernelWeightUniformLoc, Math.max(kernels.normal.reduce((previousValue, currentValue) => previousValue + currentValue), 1));

  gl.uniform1f(flipYUniformLoc, -1);

  gl.bindFramebuffer(gl.FRAMEBUFFER, null);

  gl.uniform2f(resUniformLoc, canvas.width, canvas.height);

  gl.viewport(0, 0, canvas.width, canvas.height);

  gl.drawArrays(gl.TRIANGLES, 0, 6);
};

function createTexture(gl) {
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

  return texture;
};

loadImage();