const maxX = 100;
const minX = -100;
const maxY = 100;
const minY = -100;

class Turtle {
    constructor(actX, actY, ctx, color) {
        this.ctx = ctx;
        this.ctx.strokeStyle = color
        this.actX = actX;
        this.actY = actY;
        this.angle = 0;
    }

    //coordinates conversion
    canvasX = function(x) {
        return (x - minX) / (maxX - minX) * (canvas.width);
    }
    canvasY = function(y) {
        return canvas.height - (y - minY) / (maxY - minY) * (canvas.height);
    }

    position = function(x, y) {
        this.actX = x;
        this.actY = y;
    }

    color = function(color) {
        this.ctx.strokeStyle = color;
    }

    move = function(distance) {
        this.ctx.beginPath();
        this.ctx.moveTo(this.canvasX(this.actX), this.canvasY(this.actY));
        this.actX = this.actX + Math.sin(this.angle * Math.PI / 180) * distance;
        this.actY = this.actY + Math.cos(this.angle * Math.PI / 180) * distance;
        this.ctx.lineTo(this.canvasX(this.actX), this.canvasY(this.actY));
        this.ctx.stroke();
    }

    turn = function(angle) {
        this.angle += angle;
        angle %= 360;
    }
};

var clearCanvas = function(ctx) {
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}

//hilbert's curve
var hilbertCurve = function(turtle, lenRatio, deg, angle) {
    if (deg != 0) {
        turtle.turn(angle);
        hilbertCurve(turtle, lenRatio, deg - 1, -angle);
        turtle.move(180 * lenRatio);

        turtle.turn(-angle);
        hilbertCurve(turtle, lenRatio, deg - 1, angle);
        turtle.move(180 * lenRatio);

        hilbertCurve(turtle, lenRatio, deg - 1, angle);
        turtle.turn(-angle);
        turtle.move(180 * lenRatio);

        hilbertCurve(turtle, lenRatio, deg - 1, -angle);
        turtle.turn(angle);
    }
}

window.onload = function() {
    let canvas = document.getElementById("canvas");
    let ctx = canvas.getContext("2d");

    document.getElementById("drawButton").onclick = function() {
        clearCanvas(ctx);
        var deg = document.getElementById("crDeg").value;
        hilbertCurve(new Turtle(-90, -90, ctx, "black"), Math.pow(1 / 2, deg), deg, 90);
    };
}