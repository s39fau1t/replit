class Webgl2DContext {
  constructor(canvas) {
    this.gl = canvas.getContext("webgl2");
    this.program = this.gl.createProgram();
    this.fillColor = [];
    this.globalAlpha = 1;
    this.triangles = [];
    this.texts = [];
    this.font = "";
  }

  init() {
    //setup shaders, program, vertex array, resize canvas
    this.gl.canvas.width = this.gl.canvas.clientWidth;
    this.gl.canvas.height = this.gl.canvas.clientHeight;

    this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);

    const vShaderSource = `#version 300 es

    precision highp float;

    in vec2 a_position;
    in vec4 a_color;

    out vec4 v_color;

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

    in vec4 v_color;

    out vec4 outColor;

    void main() {
      outColor = v_color;
    }
    `;

    const vertexShader = this.gl.createShader(this.gl.VERTEX_SHADER);
    const fragmentShader = this.gl.createShader(this.gl.FRAGMENT_SHADER);

    this.gl.shaderSource(vertexShader, vShaderSource);
    this.gl.shaderSource(fragmentShader, fShaderSource);

    this.gl.compileShader(vertexShader);
    this.gl.compileShader(fragmentShader);

    this.gl.attachShader(this.program, vertexShader);
    this.gl.attachShader(this.program, fragmentShader);

    this.gl.linkProgram(this.program);

    const vao = this.gl.createVertexArray();

    this.gl.bindVertexArray(vao);

    this.gl.useProgram(this.program);
  }

  background(r, g, b, a) {
    this.gl.clearColor(r / 255, g / 255, b / 255, a);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

    this.triangles = [];
    for(let text of this.texts) {
      text.remove();
    }
  }

  fillRect(x, y, width, height) {
    const r = this.fillColor[0] / 255;
    const g = this.fillColor[1] / 255;
    const b = this.fillColor[2] / 255;

    this.triangles.push(
      x, y,                  r, g, b, this.globalAlpha,
      x + width, y,          r, g, b, this.globalAlpha,
      x, y + height,         r, g, b, this.globalAlpha,
      x + width, y,          r, g, b, this.globalAlpha,
      x, y + height,         r, g, b, this.globalAlpha,
      x + width, y + height, r, g, b, this.globalAlpha
    );
  }

  fillArc(x, y, rad, ang) {
    const r = this.fillColor[0] / 255;
    const g = this.fillColor[1] / 255;
    const b = this.fillColor[2] / 255;

    for(let i = 0; i <= ang; i += 0.001) {
      this.triangles.push(
        x + Math.cos(i) * rad, y + Math.sin(i) * rad,                 r, g, b, this.globalAlpha,
        x + Math.cos(i + 0.001) * rad, y + Math.sin(i + 0.001) * rad, r, g, b, this.globalAlpha,
        x, y,                                                         r, g, b, this.globalAlpha
      );
    }
  }

  measureText(text) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    ctx.font = this.font;

    return ctx.measureText(text);
  }

  fillText(text, x, y) {
    const p = document.createElement("p");

    p.textContent = text;
    p.style.position = "fixed";

    const rect = this.gl.canvas.getBoundingClientRect();

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    ctx.font = this.font;
    const textMetrics = ctx.measureText(text);

    p.style.left = `${x + rect.x - textMetrics.width / 2}px`;
    p.style.top = `${y + rect.y}px`;
    p.style.color = `rgb(${this.fillColor[0]}, ${this.fillColor[1]}, ${this.fillColor[2]})`;
    p.style.font = this.font;
    p.style.userSelect = "none";
    p.style.filter = `drop-shadow(5px 4px 5px rgb(${this.fillColor[0]}, ${this.fillColor[1]}, ${this.fillColor[2]}))`;

    document.body.appendChild(p);

    this.texts.push(p);
  }

  render() {
    //set attribs, set uniforms, render
    const posAttribLoc = this.gl.getAttribLocation(this.program, "a_position");
    const colorAttribLoc = this.gl.getAttribLocation(this.program, "a_color");
    const resUniformLoc = this.gl.getUniformLocation(this.program, "u_resolution");

    const posBuffer = this.gl.createBuffer();

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, posBuffer);

    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.triangles), this.gl.STATIC_DRAW);

    this.gl.enableVertexAttribArray(posAttribLoc);

    this.gl.vertexAttribPointer(posAttribLoc, 2, this.gl.FLOAT, false, 6 * Float32Array.BYTES_PER_ELEMENT, 0);

    this.gl.enableVertexAttribArray(colorAttribLoc);

    this.gl.vertexAttribPointer(colorAttribLoc, 4, this.gl.FLOAT, false, 6 * Float32Array.BYTES_PER_ELEMENT, 2 * Float32Array.BYTES_PER_ELEMENT);

    this.gl.uniform2f(resUniformLoc, this.gl.canvas.width, this.gl.canvas.height);

    this.gl.drawArrays(this.gl.TRIANGLES, 0, this.triangles.length / 6);
  }
}