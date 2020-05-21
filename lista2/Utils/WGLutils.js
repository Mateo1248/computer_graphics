class WGLutils {
	static createShader(gl, type, src) {
		//Create a vertex shader object
	    var shader = gl.createShader(type);

	    //Attach vertex shader source code
	    gl.shaderSource(shader, src);

	    //Compile the vertex shader
	    gl.compileShader(shader);

	    return shader;
	}

	static createProgram(gl, verShader, fragShader) {
		// Create a shader program object to store combined shader program
	    var shaderProgram = gl.createProgram();

	    // Attach a vertex shader
	    gl.attachShader(shaderProgram, verShader); 
	         
	    // Attach a fragment shader
	    gl.attachShader(shaderProgram, fragShader);

		// Link both programs
	    gl.linkProgram(shaderProgram);

	    return shaderProgram;
	}

	static resizeCanvas(gl, canvasElement) {
        let displayWidth = canvasElement.clientWidth;
        let displayHeight = canvasElement.clientHeight;

        if (canvasElement.width !== displayWidth || canvasElement.height !== displayHeight) {
            canvasElement.width = displayWidth;
            canvasElement.height = displayHeight;
            gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        }
    }
}