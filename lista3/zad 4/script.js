/* SHADER PROGRAM 1 */
/* vertex shader source code */
var vertexShaderSrc= ""+
    "attribute vec4 aVertexPosition; \n"+
    "uniform vec3 uMove; \n"+
    "uniform mat4 rotation;\n"+
    "uniform mat4 projection;\n"+
    "varying vec3 vColorRGB; \n"+
    "void main(void) { \n"+
    "  gl_PointSize = 6.0; \n"+
    "  gl_Position =  projection * (rotation * aVertexPosition + vec4(uMove, 0)); \n"+
    "  vColorRGB = (vec3(0.0, 0.5, 0.5) + gl_Position.b) * 0.3; \n"+
    "} \n";

/* fragment shader source code */
var fragmentShaderSrc= ""+
    "precision mediump float; \n"+ 
    "varying vec3 vColorRGB; \n"+ 
    "void main(void) { \n"+
    "  gl_FragColor = vec4(vColorRGB, 1.0); \n"+
    "} \n";

/* SHADER PROGRAM 2 */
/* vertex shader source code */
var vertexShaderSrc2= ""+
    "attribute vec4 aVertexPosition; \n"+
    "uniform mat4 projection;\n"+
    "uniform mat4 rotation;\n"+
    "uniform vec3 uMove; \n"+
    "varying vec3 vColorRGB; \n"+
    "void main(void) { \n"+
    "  gl_PointSize = 3.0; \n"+
    "  gl_Position =  projection * (rotation * aVertexPosition + vec4(uMove, 0)); \n"+
    "  vColorRGB = (vec3(0.0, 0.0, 0.0) + gl_Position.b) * 0.3; \n"+
    "} \n";

/* fragment shader source code */
var fragmentShaderSrc2= ""+
    "precision mediump float; \n"+ 
    //"uniform vec3 uColorRGB; \n"+ 
    "varying vec3 vColorRGB; \n"+ 
    "void main(void) { \n"+
    "  gl_FragColor = vec4(vColorRGB, 1.0); \n"+
    "} \n";

var gl; // GL context
var glObjects; // references to various GL objects
var html; // HTML objects
var data; // user data

var glInit= function(canvas) {
    gl = canvas.getContext("experimental-webgl");
    gl.viewportWidth = canvas.width;
    gl.viewportHeight = canvas.height;

    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

    glObjects = {}; 

    /* create executable shader program */
    glObjects.shaderProgram = compileAndLinkShaderProgram(gl, vertexShaderSrc, fragmentShaderSrc);
    /* attributes */
    glObjects.aVertexPositionLocation = gl.getAttribLocation(glObjects.shaderProgram, "aVertexPosition");
    gl.enableVertexAttribArray(glObjects.aVertexPositionLocation);
    /* uniform variables */
    glObjects.uMoveLocation = gl.getUniformLocation(glObjects.shaderProgram, "uMove");
    glObjects.rotationLocation=gl.getUniformLocation(glObjects.shaderProgram, "rotation");
    glObjects.projectionLocation = gl.getUniformLocation(glObjects.shaderProgram, "projection");

    /* create executable shader program 2 */
    glObjects.shaderProgram2 = compileAndLinkShaderProgram(gl, vertexShaderSrc2, fragmentShaderSrc2);
    /* attributes */
    glObjects.aVertexPositionLocation2 = gl.getAttribLocation(glObjects.shaderProgram2, "aVertexPosition");
    gl.enableVertexAttribArray(glObjects.aVertexPositionLocation2);
    /* uniform variables */
    glObjects.uMoveLocation2 = gl.getUniformLocation(glObjects.shaderProgram2, "uMove");
    //glObjects.uColorRGBLocation2 = gl.getUniformLocation(glObjects.shaderProgram2, "uColorRGB");
    glObjects.projectionLocation2 = gl.getUniformLocation(glObjects.shaderProgram2, "projection");
    glObjects.rotationLocation2 = gl.getUniformLocation(glObjects.shaderProgram2, "rotation");
};

/* some functions: [-1,1] -> R */
var f1 = function(x, y) { // hearth
    return Math.exp(x) + Math.exp(y);
};

var f2 = function(x, y) {
    return x*Math.sin(y);
};

var f3 = function(x, y) {
    return x*x + 2*x*y - y*y;
};

var f4 = function(x, y) {
    return x * x - y * y;
    // return f3(x,y);
};


var choosedFunction = [f1,f2,f3,f4];
var choosedFunctionIndex =1;
var dataInit=function() {
    data = {};
    data.background = [1.0, 1.0, 1.0, 1.0];

    data.vertexPositions1 = functionPlot(choosedFunction[choosedFunctionIndex]);
    glObjects.bufferId1 = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, glObjects.bufferId1);
    gl.bufferData(gl.ARRAY_BUFFER, data.vertexPositions1 , gl.STATIC_DRAW);
    data.move1 = [0, 0.0, 2];   
    data.colorRGB1 = [1.0, 0, 0]; 

    data.vertexPositions2 = functionPlot(choosedFunction[choosedFunctionIndex]);
    glObjects.bufferId2 = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, glObjects.bufferId2);
    gl.bufferData(gl.ARRAY_BUFFER, data.vertexPositions2 , gl.STATIC_DRAW);
    data.move2 = [0, 0.0, 2];   
    data.colorRGB2 = [0, 1.0, 0];   

    data.vertexPositions3 = functionPlot(choosedFunction[choosedFunctionIndex]);
    glObjects.bufferId3 = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, glObjects.bufferId3);
    gl.bufferData(gl.ARRAY_BUFFER, data.vertexPositions3 , gl.STATIC_DRAW);
    data.move3 = [0, 0.0, 2];   
    data.colorRGB3 = [0, 1.0, 0];
}; 

var redraw = function() {
    var bg = data.background;

    /* prepare clean screen */
    gl.clearColor(bg[0], bg[1], bg[2], bg[3]);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    /* matrix */
    var projectionMatrix = glMatrix4FromMatrix(createProjectionMatrix4(
                                gl,
                                PROJECTION_Z_NEAR, 
                                PROJECTION_Z_FAR,
                                PROJECTION_ZOOM_Y));
    var rotationMatrix = glMatrix4FromMatrix(rotationMatrix4); //tmp

    /* draw object 1 */
    gl.useProgram(glObjects.shaderProgram);
    gl.enableVertexAttribArray(glObjects.aVertexPositionLocation);
    gl.uniformMatrix4fv(glObjects.rotationLocation, false,  rotationMatrix);
    gl.uniformMatrix4fv(glObjects.projectionLocation, false, projectionMatrix);
    gl.bindBuffer(gl.ARRAY_BUFFER, glObjects.bufferId1); /* refer to the buffer */
    gl.vertexAttribPointer(glObjects.aVertexPositionLocation, 3 /* 2 floats per vertex */, gl.FLOAT, false, 0 /* stride */, 0 /*offset */);
    gl.uniform3fv(glObjects.uMoveLocation, data.move1);
    gl.drawArrays(gl.POINTS, 0 /* offset */, 40000);

    /* draw object 2 */
    gl.useProgram(glObjects.shaderProgram2);
    gl.enableVertexAttribArray(glObjects.aVertexPositionLocation2);
    gl.uniformMatrix4fv(glObjects.rotationLocation2, false, rotationMatrix);
    gl.uniformMatrix4fv(glObjects.projectionLocation2, false, projectionMatrix);
    gl.uniform3fv(glObjects.uMoveLocation2, data.move2);
    gl.uniform3fv(glObjects.uColorRGBLocation2, data.colorRGB2);
    gl.bindBuffer(gl.ARRAY_BUFFER, glObjects.bufferId2); /* refer to the buffer */
    gl.vertexAttribPointer(glObjects.aVertexPositionLocation2, 3 /* 2 floats per vertex */, gl.FLOAT, false, 0 /* stride */, 0 /*offset */);
    gl.drawArrays(gl.POINTS, 0 /* offset */, 4200);

    /* draw object 3 */
    gl.useProgram(glObjects.shaderProgram2);
    gl.enableVertexAttribArray(glObjects.aVertexPositionLocation2);
    gl.uniformMatrix4fv(glObjects.rotationLocation2, false, rotationMatrix);
    gl.uniformMatrix4fv(glObjects.projectionLocation2, false, projectionMatrix);
    gl.uniform3fv(glObjects.uMoveLocation2, data.move3);
    gl.uniform3fv(glObjects.uColorRGBLocation2, data.colorRGB3);
    gl.bindBuffer(gl.ARRAY_BUFFER, glObjects.bufferId3); /* refer to the buffer */
    gl.vertexAttribPointer(glObjects.aVertexPositionLocation2, 3 /* 2 floats per vertex */, gl.FLOAT, false, 0 /* stride */, 0 /*offset */);
    gl.drawArrays(gl.POINTS, 0 /* offset */, 4200);
};

var functionPlot = function(f) {
    var vArray = [];
    for(var x =- 1; x < 1; x += 0.01) {
        for(var y =- 1; y < 1; y += 0.01) {
            vArray.push(x);
            vArray.push(y);
            vArray.push(f(x, y));
        }
    }
    return new Float32Array(vArray);
}

/* create Float32Array with vertex (x,y) coordinates */
/*var functionPlot= function( f ){
    var stepX= 2.0/data.NUMBER_OF_VERTICES;
    var x=-1.0;
    var vArray=[];
    var i;
    for(i=0; i<data.NUMBER_OF_VERTICES; i++){
    y=f(x);
    vArray.push(x);
    vArray.push(y);
    x+= stepX;
    }
    return new Float32Array( vArray );
}*/

var htmlInit= function() {
    html = {};
    html.html = document.querySelector('#htmlId');
    html.canvas = document.querySelector('#canvasId');
};

/* create executable shader program */
var compileAndLinkShaderProgram = function (gl, vertexShaderSource, fragmentShaderSource) {
    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vertexShaderSource);
    gl.compileShader(vertexShader);
    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
        console.log(gl.getShaderInfoLog(vertexShader));
        console.log(gl);
        return null;
    }

    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fragmentShaderSource);
    gl.compileShader(fragmentShader);
    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
        console.log(gl.getShaderInfoLog(fragmentShader));
        console.log(gl);
        return null;
    }

    var shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        console.log("Could not initialise shaders");
        console.log(gl);
        return null;
    }
    // SUCCESS 
    return shaderProgram;
};

const PROJECTION_Z_NEAR = 0.25;
const PROJECTION_Z_FAR = 300;
const PROJECTION_ZOOM_Y = 0.8;

var createProjectionMatrix4 = function(gl, zNear, zFar, zoomY) {
    var xx = zoomY * gl.viewportHeight / gl.viewportWidth;
    var yy = zoomY;
    var zz = (zFar + zNear) / (zFar - zNear);
    var zw = 1;
    var wz = -2 * zFar * zNear / (zFar - zNear);
    return [
        [xx, 0, 0, 0],
        [0, yy, 0, 0],
        [0, 0, zz, wz],
        [0, 0, zw, 0]
    ];
}

var glMatrix4 = function (xx, yx, zx, wx,
                xy, yy, zy, wy,
                xz, yz, zz, wz,
                xw, yw, zw, ww) {
    return new Float32Array( [ xx, xy, xz, xw,
                               yx, yy, yz, yw,
                               zx, zy, zz, zw,
                               wx, wy, wz, ww]);
};

var glMatrix4FromMatrix = function(m) {
    return glMatrix4( 
        m[0][0], m[0][1], m[0][2], m[0][3],
        m[1][0], m[1][1], m[1][2], m[1][3],
        m[2][0], m[2][1], m[2][2], m[2][3],
        m[3][0], m[3][1], m[3][2], m[3][3]
    );
};

var scalarProduct4 = function(v, w) {
    return v[0] * w[0] + v[1] * w[1] + v[2] * w[2] + v[3] * w[3];
};

var matrix4Column = function(m, c) {
    return [m[0][c], m[1][c], m[2][c], m[3][c]]; 
};

var matrix4Product = function(m1, m2) { 
    var sp = scalarProduct4;
    var col = matrix4Column;
    return [ 
        [sp(m1[0], col(m2, 0)), sp(m1[0], col(m2, 1)), sp(m1[0], col(m2, 2)), sp(m1[0], col(m2, 3))], 
        [sp(m1[1], col(m2, 0)), sp(m1[1], col(m2, 1)), sp(m1[1], col(m2, 2)), sp(m1[1], col(m2, 3))], 
        [sp(m1[2], col(m2, 0)), sp(m1[2], col(m2, 1)), sp(m1[2], col(m2, 2)), sp(m1[1], col(m2, 3))], 
        [sp(m1[3], col(m2, 0)), sp(m1[3], col(m2, 1)), sp(m1[3], col(m2, 2)), sp(m1[3], col(m2, 3))] 
    ];
};

var matrix4RotatedXZ = function(matrix, alpha) {
    var c = Math.cos(alpha);
    var s = Math.sin(alpha); 
    var rot = [ [c, 0, -s, 0],
                [0, 1, 0, 0],
                [s, 0, c, 0],
                [0, 0, 0, 1]
              ];
    return matrix4Product(rot, matrix);
};

var matrix4RotatedYZ = function(matrix, alpha) {
    var c = Math.cos(alpha);
    var s = Math.sin(alpha); 
    var rot = [ [1, 0, 0, 0],
                [0, c, -s, 0],
                [0, s, c, 0], 
                [0, 0, 0, 1]
              ];

    return matrix4Product(rot, matrix);
};

var callbackOnWindowResize = function() {
    var wth = parseInt(window.innerWidth) - 10;
    var hth = parseInt(window.innerHeight) - 10;
    var canvas = html.canvas;
    canvas.setAttribute("width", '' + wth);
    canvas.setAttribute("height", '' + hth);
    gl.viewportWidth = wth;
    gl.viewportHeight = hth;
    gl.viewport(0, 0, wth, hth);
    redraw();
};

const identityMatrix4 = [ [ 1,0,0,0 ],
                          [ 0,1,0,0 ],
                          [ 0,0,1,0 ],
                          [ 0,0,0,1 ],
                        ];


var rotationMatrix4 = identityMatrix4;

var callbackOnKeyDown = function(e) {
    const step = 0.02;
    var code = e.which || e.keyCode;
    var alpha = Math.PI / 32;
    switch(code) {
        case 38: // up
        case 73: // I
            //data.move2[1] += step;
            rotationMatrix4 = matrix4RotatedYZ(rotationMatrix4, alpha);
        break;
        case 40: // down
        case 75: // K
            //data.move2[1] -= step;
            rotationMatrix4 = matrix4RotatedYZ(rotationMatrix4, -alpha);
        break;
        case 37: // left
        case 74:// J
            //data.move2[0] -= step;
            rotationMatrix4 = matrix4RotatedXZ(rotationMatrix4, -alpha);
        break;
        case 39:// right
        case 76: // L
            //data.move2[0]+=step;
            rotationMatrix4 = matrix4RotatedXZ(rotationMatrix4, alpha);
        break;
        case 70: // F
            data.move1[2] += step;
            data.move2[2] += step;
            data.move3[2] += step;
        break;
        case 66: // B
            data.move1[2] -= step;
            data.move2[2] -= step;
            data.move3[2] -= step;
        break;
        case 32: // space
        rotationMatrix4 = identityMatrix4;
        break;
        case 13: // enter
            choosedFunctionIndex++;
            choosedFunctionIndex = choosedFunctionIndex % 4;
            dataInit();
            break;
    }
    redraw();
}

window.onload = function() {
    htmlInit();
    glInit(html.canvas);
    dataInit();

    window.onresize = callbackOnWindowResize;
    callbackOnWindowResize(); 
    window.onkeydown = callbackOnKeyDown;
};
