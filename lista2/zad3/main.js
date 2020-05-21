"use strict";
var canvas = document.getElementById("canvas");
var gl = canvas.getContext("webgl2");

const POINT_SIZE = canvas.clientHeight * 0.025;
const LINE_WIDTH = canvas.clientWidth * 0.0025;
const PIXELS_PER_SEC = canvas.clientWidth * 0.333;
const ACCELERATION = 1.08;

var vertexShaderSource = `#version 300 es

// an attribute is an input (in) to a vertex shader.
// It will receive data from a buffer
in vec2 a_position;
in vec2 a_texcoord;

// Used to pass in the resolution of the canvas
uniform vec2 u_resolution;

// translation to add to position
uniform vec2 u_translation;

out vec2 v_texcoord;

// all shaders have a main function
void main() {
  // Add in the translation
  vec2 position = a_position + u_translation;

  // convert the position from pixels to 0.0 to 1.0
  vec2 zeroToOne = position / u_resolution;

  // convert from 0->1 to 0->2
  vec2 zeroToTwo = zeroToOne * 2.0;

  // convert from 0->2 to -1->+1 (clipspace)
  vec2 clipSpace = zeroToTwo - 1.0;
  
  gl_Position = vec4(clipSpace, 0, 1);
  gl_PointSize = ${POINT_SIZE.toFixed(1)};

  v_texcoord = a_texcoord;
}
`;

var fragmentShaderSource = `#version 300 es

precision mediump float;

// Passed in from the vertex shader.
in vec2 v_texcoord;

// The texture.
uniform sampler2D u_texture;
uniform vec4 u_color;

// we need to declare an output for the fragment shader
out vec4 outColor;

void main() {
    outColor = texture(u_texture, v_texcoord) + u_color;
}
`;

var drawables = [];

const plankWidth = canvas.clientWidth * 0.025;
const plankHeight = canvas.clientHeight * 0.25;

const DATA = {
    plank: {
        geometry: [
            0, 0,
            plankWidth, 0,
            0, plankHeight,
            plankWidth, plankHeight,
        ],
        type: gl.TRIANGLE_STRIP,
        vertices: 4,
    },

    ball: {
        geometry: [0, 0],
        type: gl.POINTS,
        vertices: 1,
    },

    fieldLine: {
        geometry: [
            0, 0,
            0, canvas.clientHeight,
        ],
        type: gl.LINES,
        vertices: 2,
    },

    fieldCenter: {
        geometry: [
            -canvas.clientWidth, -canvas.clientHeight,
            canvas.clientWidth, -canvas.clientHeight,
            canvas.clientWidth, canvas.clientHeight,
            -canvas.clientWidth, canvas.clientHeight,
        ],
        type: gl.TRIANGLE_FAN,
        vertices: 4,
    },

    fieldCenterRhombus: {
        geometry: [
            0, -canvas.clientHeight * 0.05,
            canvas.clientWidth * 0.05, 0,
            0, canvas.clientHeight * 0.05,
            -canvas.clientWidth * 0.05, 0,
        ],
        type: gl.TRIANGLE_FAN,
        vertices: 4,
    }
};

// Use our boilerplate utils to compile the shaders and link into a program
const vertexShader = WGLutils.createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
const fragmentShader = WGLutils.createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
var program = WGLutils.createProgram(gl, vertexShader, fragmentShader);

// look up where the vertex data needs to go.
var positionAttributeLocation = gl.getAttribLocation(program, "a_position");
var texcoordAttributeLocation = gl.getAttribLocation(program, "a_texcoord");

// look up uniform locations
var resolutionUniformLocation = gl.getUniformLocation(program, "u_resolution");
var colorLocation = gl.getUniformLocation(program, "u_color");
var translationLocation = gl.getUniformLocation(program, "u_translation");
var textureUniformLocation = gl.getUniformLocation(program, "u_texture");

class Drawable {
    constructor(geometry, verticesNumber, type, translation, color) {
        /* Drawing data */
        this.buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(geometry), gl.STATIC_DRAW);
        this.type = type;
        this.count = verticesNumber;
        this.moveVector = [0, 0];

        this.translation = translation || [0, 0];
        this.color = color || this.randomColor();
    }

    getCollisionRange() {
        var xmin = this.translation[0];
        var xmax = this.translation[0] + plankWidth;
        var ymin = this.translation[1];
        var ymax = this.translation[1] + plankHeight;
        return {
            x: { min: xmin, max: xmax },
            y: { min: ymin, max: ymax },
        };
    }

    moveUpdate(deltaTime) {

    }

    randomColor() {
        return [Math.random(), Math.random(), Math.random(), 1];
    }

    randomMoveVector() {
        return [(Math.random() > 0.5 ? 1 : -1), ((Math.random() * 2) - 1) * 0.5];
    }

    draw() {
        // Turn on the attribute
        gl.enableVertexAttribArray(positionAttributeLocation);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);

        gl.lineWidth(LINE_WIDTH);

        // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
        var size = 2;          // 2 components per iteration
        var type = gl.FLOAT;   // the data is 32bit floats
        var normalize = false; // don't normalize the data
        var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
        var offset = 0;        // start at the beginning of the buffer
        gl.vertexAttribPointer(
            positionAttributeLocation, size, type, normalize, stride, offset);

        // Set the color.
        gl.uniform4fv(colorLocation, this.color);

        // Set the translation.
        gl.uniform2fv(translationLocation, this.translation);

        // Draw the geometry.
        var primitiveType = this.type;
        var offset = 0;
        var count = this.count;
        gl.drawArrays(primitiveType, offset, count);
    }
}

class DrawableTexture extends Drawable {
    constructor(geometry, verticesNumber, type, translation, color, textureUrl) {
        super(geometry, verticesNumber, type, translation, color);

        this.texture = loadTexture(gl, textureUrl);
        this.textureCoordBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.textureCoordBuffer);

        this.textureCoordinates = [
            // Front
            0, 0,
            1, 0,
            1, 1,
            0, 1,
        ];

        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.textureCoordinates),
            gl.STATIC_DRAW);
    }

    draw() {
        const num = 2; // every coordinate composed of 2 values
        const type = gl.FLOAT; // the data in the buffer is 32 bit float
        const normalize = false; // don't normalize
        const stride = 0; // how many bytes to get from one set to the next
        const offset = 0; // how many bytes inside the buffer to start from
        gl.bindBuffer(gl.ARRAY_BUFFER, this.textureCoordBuffer);
        gl.vertexAttribPointer(texcoordAttributeLocation, num, type, normalize, stride, offset);
        gl.enableVertexAttribArray(texcoordAttributeLocation);

        // Tell WebGL we want to affect texture unit 0
        gl.activeTexture(gl.TEXTURE0);
        // Bind the texture to texture unit 0
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        // Tell the shader we bound the texture to texture unit 0
        gl.uniform1i(textureUniformLocation, 0);

        super.draw();
    }
}

class Plank extends DrawableTexture {
    constructor(geometry, verticesNumber, type, keys, translation, color, textureUrl) {
        super(geometry, verticesNumber, type, translation, color, textureUrl);

        this.moveVector = [0, 1];
        this.keys = keys || { up: 'w', down: 's' };

        this.keysPressed = {};

        window.addEventListener('keydown', (event) => {
            this.keysPressed[event.key] = true;
        });
        window.addEventListener('keyup', (event) => {
            this.keysPressed[event.key] = false;
        });
    }

    moveUpdate(deltaTime) {
        if (this.keysPressed[this.keys.up] === true) {
            this.translation[1] += PIXELS_PER_SEC * deltaTime;
        }
        if (this.keysPressed[this.keys.down] === true) {
            this.translation[1] -= PIXELS_PER_SEC * deltaTime;
        }
    }
}

class Ball extends Drawable {
    constructor(geometry, verticesNumber, type, translation, moveVector, color) {
        super(geometry, verticesNumber, type, translation, color);
        this.moveVector = moveVector || this.randomMoveVector();
        this.collidables = [];
        this.isInsideCollidable = false;
    }

    moveUpdate(deltaTime) {
        this.bounce(this.detectCollision());
        this.translation[0] += PIXELS_PER_SEC * this.moveVector[0] * deltaTime;
        this.translation[1] += PIXELS_PER_SEC * this.moveVector[1] * deltaTime;
    }

    registerCollisionObject(obj) {
        if (!(obj instanceof Drawable)) {
            throw new Error('Object must be of type Drawable');
        }
        this.collidables.push(obj);
    }

    bounce(modifiers) {
        if (modifiers != null) {
            this.isInsideCollidable = true;
            this.moveVector[0] = this.moveVector[0] * modifiers[0] * ACCELERATION;
            this.moveVector[1] = this.moveVector[1] * modifiers[1] * ACCELERATION;
        } else {
            this.isInsideCollidable = false;
        }
    }

    detectCollision() {
        var range;
        var x = this.translation[0];
        var y = this.translation[1];
        var ballOffset = (POINT_SIZE / 2);
        for (var obj of this.collidables) {
            range = obj.getCollisionRange();
            if (!this.isInsideCollidable &&
                range.x.min - ballOffset <= x && x <= range.x.max + ballOffset &&
                range.y.min - ballOffset <= y && y <= range.y.max + ballOffset
            ) {
                return [-1, 1];
            }
        }

        if (y <= 0 || canvas.clientHeight <= y) {
            return [1, -1];
        }

        if (x <= 0 || canvas.clientWidth <= x) {
            this.translation = [canvas.clientWidth / 2, canvas.clientHeight / 2];
            this.moveVector = this.randomMoveVector();
            this.color = [0,0,0,1];
        }

        return null;
    }
}

drawables.push(
    new DrawableTexture(
        DATA.fieldCenter.geometry,  
        DATA.fieldCenter.vertices,
        DATA.fieldCenter.type,
        [canvas.clientWidth / 2, canvas.clientHeight / 2],
        [0, 0, 0, 1],
        'background.jpg'
    )
);

drawables.push(
    new Plank(
        DATA.plank.geometry, 
        DATA.plank.vertices, 
        DATA.plank.type, 
        null, 
        null, 
        [0, 0, 0, 0], 
        'platform.jpeg'
    )
);

drawables.push(
    new Plank(
        DATA.plank.geometry,
        DATA.plank.vertices,
        DATA.plank.type,
        { up: "ArrowUp", down: "ArrowDown" },
        [canvas.clientWidth - plankWidth, canvas.clientHeight - plankHeight],
        [0, 0, 0, 0],
        'platform.jpeg'
    )
);

drawables.push(
    new Drawable(
        DATA.fieldLine.geometry,
        DATA.fieldLine.vertices,
        DATA.fieldLine.type,
        [canvas.clientWidth / 2, 0],
        [0, 0, 0, 1],
    )
);

function addNewBall(drawables, color) {
    var ball = new Ball(
        DATA.ball.geometry,
        DATA.ball.vertices,
        DATA.ball.type,
        [canvas.clientWidth / 2, canvas.clientHeight / 2],
        null,
        color
    );
    ball.registerCollisionObject(drawables[1]);
    ball.registerCollisionObject(drawables[2]);
    drawables.push(ball);
}
for (let i = 0; i < 1; i += 1) {
    addNewBall(drawables, [0, 0, 0, 1]);
}

// Draw the scene.
var then = 0;
function drawScene(now) {
    now *= 0.001;
    var deltaTime = now - then;
    then = now;

    WGLutils.resizeCanvas(gl, gl.canvas);   

    // Clear the canvas
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Tell it to use our program (pair of shaders)
    gl.useProgram(program);

    // Pass in the canvas resolution so we can convert from
    // pixels to clipspace in the shader
    gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);

    for (var obj of drawables) {
        obj.moveUpdate(deltaTime);
    }

    for (var obj of drawables) {
        obj.draw();
    }

    requestAnimationFrame(drawScene);
}


//
// Initialize a texture and load an image.
// When the image finished loading copy it into the texture.
//
function loadTexture(gl, url) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Because images have to be download over the internet
    // they might take a moment until they are ready.
    // Until then put a single pixel in the texture so we can
    // use it immediately. When the image has finished downloading
    // we'll update the texture with the contents of the image.
    const level = 0;
    const internalFormat = gl.RGBA;
    const width = 1;
    const height = 1;
    const border = 0;
    const srcFormat = gl.RGBA;
    const srcType = gl.UNSIGNED_BYTE;
    const pixel = new Uint8Array([255, 255, 255, 255]);  // opaque blue
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
        width, height, border, srcFormat, srcType,
        pixel);

    const image = new Image();
    image.onload = function () {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
            srcFormat, srcType, image);

        // WebGL1 has different requirements for power of 2 images
        // vs non power of 2 images so check if the image is a
        // power of 2 in both dimensions.
        if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
            // Yes, it's a power of 2. Generate mips.
            gl.generateMipmap(gl.TEXTURE_2D);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        } else {
            // No, it's not a power of 2. Turn of mips and set
            // wrapping to clamp to edge
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        }
    };
    image.src = url;

    return texture;
}

function isPowerOf2(value) {
    return (value & (value - 1)) == 0;
}


///////////////////////////////////////START
requestAnimationFrame(drawScene);
////////////////////////////////////////////

window.addEventListener('keypress', (event) => {
    if (event.key === 'b') {
        addNewBall(drawables, [0,0,0,1]);
    }
});