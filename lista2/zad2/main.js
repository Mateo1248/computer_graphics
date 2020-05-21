let h1 = [
    0.0, 0.0,
    0.0, 0.5,
    0.5, 0.5,
    0.5, 0.0
];

let h2 = [
    0.0, 0.0,
    0.2, 0.0,
    0.2, 0.2,
    0.0, 0.2,
    0.0, 0.4,
    0.0, 0.6,
    0.2, 0.6,
    0.2, 0.4,
    0.4, 0.4,
    0.4, 0.6,
    0.6, 0.6,
    0.6, 0.4,
    0.6, 0.2,
    0.4, 0.2,
    0.4, 0.0,
    0.6, 0.0
];

let h3 = [
    0.0, 0.0,
    0.0, 0.1,
    0.1, 0.1,
    0.1, 0.0,
    0.2, 0.0,
    0.3, 0.0,
    0.3, 0.1,
    0.2, 0.1,
    0.2, 0.2,
    0.3, 0.2,
    0.3, 0.3,
    0.2, 0.3,
    0.1, 0.3,
    0.1, 0.2,
    0.0, 0.2,
    0.0, 0.3,
    0.0, 0.4,
    0.1, 0.4,
    0.1, 0.5,
    0.0, 0.5,
    0.0, 0.6,
    0.0, 0.7,
    0.1, 0.7,
    0.1, 0.6,
    0.2, 0.6,
    0.2, 0.7,
    0.3, 0.7,
    0.3, 0.6,
    0.3, 0.5,
    0.2, 0.5,
    0.2, 0.4,
    0.3, 0.4,
    0.4, 0.4,
    0.5, 0.4,
    0.5, 0.5,
    0.4, 0.5,
    0.4, 0.6,
    0.4, 0.7,
    0.5, 0.7,
    0.5, 0.6,
    0.6, 0.6,
    0.6, 0.7,
    0.7, 0.7,
    0.7, 0.6,
    0.7, 0.5,
    0.6, 0.5,
    0.6, 0.4,
    0.7, 0.4,
    0.7, 0.3,
    0.7, 0.2,
    0.6, 0.2,
    0.6, 0.3,
    0.5, 0.3,
    0.4, 0.3,
    0.4, 0.2,
    0.5, 0.2,
    0.5, 0.1,
    0.4, 0.1,
    0.4, 0.0,
    0.5, 0.0,
    0.6, 0.0,
    0.6, 0.1,
    0.7, 0.1,
    0.7, 0.0
];

var current;
var canvas;
var gl;

var posX;
var posY;
var posZ;
var depth1;
var depth2;
var depth3;
var rgb1;
var rgb2;
var rgb3;


/*
* main function 
*/
window.onload = function() {
    current = document.getElementById('current');
    canvas = document.getElementById("canvas");
    gl = canvas.getContext("webgl");

    gl.clearColor(1, 1, 1, 1);
    gl.enable(gl.DEPTH_TEST);

    posX = 0.0;
    posY = 0.0;
    posZ = 0.0;

    depth1 = 0.1;
    depth2 = 0.5;
    depth3 = 0.9;
    rgb1 = randomRGB();
    rgb2 = randomRGB();
    rgb3 = randomRGB();

    hilbert();
}

function draw(hType, hDepth, hR, hG, hB){
    let vertex_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(hType), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    let verShaderSrc =
        'attribute vec2 coordinates;' +
        'uniform vec4 translation;'+
        'void main(void) {' +
        'gl_Position = vec4(coordinates, ' + hDepth + ', 1.0) + translation;' +
        '}';

    let fragShaderSrc =
        'void main(void) {' +
        'gl_FragColor = vec4('+hR+','+hG+','+hB+', 1.0);' +
        '}';

    const vertexShader = WGLutils.createShader(gl, gl.VERTEX_SHADER, verShaderSrc);
    const fragmentShader = WGLutils.createShader(gl, gl.FRAGMENT_SHADER, fragShaderSrc);
    WGLutils.resizeCanvas(gl, gl.canvas);

    let shaderProgram = WGLutils.createProgram(this.gl, vertexShader, fragmentShader);
    gl.useProgram(shaderProgram);

    gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
    let coord = gl.getAttribLocation(shaderProgram, "coordinates");

    gl.vertexAttribPointer(coord, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(coord);

    let translation = gl.getUniformLocation(shaderProgram, 'translation');
    gl.uniform4f(translation, posX, posY, posZ, 0.0);
    gl.drawArrays(gl.LINE_STRIP, 0, hType.length/2);
}

function randomRGB() {
    return  {
        R: Number((Math.random() * (2) -1).toFixed(2)),
        G: Number((Math.random() * (2) -1).toFixed(2)),
        B: Number((Math.random() * (2) -1).toFixed(2)),
    }
}

function increaseDepth() {
    posZ+=0.4;
    hilbert();
}

function decreaseDepth() {
    posZ+=-0.4;
    hilbert();
}

function moveLeft() {
    posX+=-0.1;
    hilbert();
}

function moveRight() {
    posX+=0.1;
    hilbert();
}

function moveUp() {
    posY+=0.1;
    hilbert();
}

function moveDown() {
    posY+=-0.1;
    hilbert();
}

function changeColor() {
    rgb1 = randomRGB();
    rgb2 = randomRGB();
    rgb3 = randomRGB();
    hilbert();
}

function hilbert(){
    draw(h1, depth1, rgb1.R, rgb1.G, rgb1.B );
    draw(h2, depth2, rgb2.R, rgb2.G, rgb2.B );
    draw(h3, depth3, rgb3.R, rgb3.G, rgb3.B );
}

