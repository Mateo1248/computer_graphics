/*
* shader programs
*/
var verShaderSrc =`
attribute vec2 a_position;
attribute vec4 a_color;
uniform vec2 u_resolution;
varying vec4 v_color;

void main() {
    vec2 zeroToOne = a_position / u_resolution;
    vec2 zeroToTwo = zeroToOne * 2.0;
    vec2 clipSpace = zeroToTwo - 1.0;

    gl_PointSize = 5.0;
    gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
    v_color = a_color;
}`;

var fragShaderSrc = `
precision mediump float;
varying vec4 v_color;

void main() {
    gl_FragColor = v_color;
}`;

/*
* main function	
*/
window.onload = function() {
	var current = document.getElementById('current');
	var canvas = document.getElementById("canvas");
	var gl = canvas.getContext("webgl");

	var type = gl.POINTS;
    var changed = false;

    document.querySelector('nav').addEventListener('click', event => {
        if (event.target.id) {
            const name = event.target.id.toUpperCase();
            type = gl[name];
            current.textContent = `NOW: ${name}`;

            positions = [];
            colors = [];
            for(let i = 0 ; i < 10 ; i++) {
            	positions.push(Math.random()*canvas.width);
            	positions.push(Math.random()*canvas.height);
            	colors.push(Math.random());
            	colors.push(Math.random());
            	colors.push(Math.random());
            	colors.push(1);
            }

           	changed = true;
        }
    });

	const vertexShader = WGLutils.createShader(gl, gl.VERTEX_SHADER, verShaderSrc);
    const fragmentShader = WGLutils.createShader(gl, gl.FRAGMENT_SHADER, fragShaderSrc);
    WGLutils.resizeCanvas(gl, gl.canvas);

	const drawer = new Drawer(gl, vertexShader, fragmentShader);


	function drawLoop() {
        if (changed) {
            changed = false;
            drawer.bufferPositions(positions);
            drawer.bufferColors(colors);
            drawer.draw(type);
            console.log(drawer.getInfo());
        }
        requestAnimationFrame(drawLoop);
    }
    drawLoop();
}


class Drawer {
    constructor(gl, vertexShader, fragmentShader) {
        this.gl = gl;

        this.program = WGLutils.createProgram(this.gl, vertexShader, fragmentShader);
        this.colorBuffer = null;
        this.positionBuffer = null;

        this.drawCount = 0;

        this.positionLocation = this.gl.getAttribLocation(this.program, 'a_position');
        this.colorLocation = this.gl.getAttribLocation(this.program, 'a_color');
        this.resolutionLocation = gl.getUniformLocation(this.program, 'u_resolution');
    }

    bufferColors(colors) { // [r1, g2, b1, a1, r2, g2, b2, a2, ...]
        this.colorBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.colorBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(colors), this.gl.STATIC_DRAW);
    }

    bufferPositions(positions) { // [x1, y1, x2, y2, x3, y3, ...]
        this.drawCount = positions.length / 2;
        this.positionBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(positions), this.gl.STATIC_DRAW);
    }

    draw(primitiveType) {
        this.gl.clearColor(0, 0, 0, 0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);

        this.gl.useProgram(this.program);
        this.gl.uniform2f(this.resolutionLocation, this.gl.canvas.width, this.gl.canvas.height);

        // positions
        this.gl.enableVertexAttribArray(this.positionLocation);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
        let size = 2;
        let type = this.gl.FLOAT;
        let normalize = false;
        let stride = 0;
        let offset = 0;
        this.gl.vertexAttribPointer(this.positionLocation, size, type, normalize, stride, offset);

        // colors
        this.gl.enableVertexAttribArray(this.colorLocation);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.colorBuffer);
        size = 4;
        type = this.gl.FLOAT;
        normalize = false;
        stride = 0;
        offset = 0;
        this.gl.vertexAttribPointer(this.colorLocation, size, type, normalize, stride, offset);

        this.gl.drawArrays(primitiveType, 0, this.drawCount);
    }

    getInfo() {
        let res = {
            attributes: [],
            uniforms: []
        };
        let indices = this.gl.getProgramParameter(this.program, this.gl.ACTIVE_ATTRIBUTES);
        while (indices-->0) res.attributes.push(this.gl.getActiveAttrib(this.program, indices));
        indices = this.gl.getProgramParameter(this.program, this.gl.ACTIVE_UNIFORMS);
        while (indices-->0) res.uniforms.push(this.gl.getActiveUniform(this.program, indices));
        return res;
    }
}