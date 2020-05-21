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

//clear screen
var clearCanvas = function(ctx) {
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}

//clear text area
var clearTextArea = function() {
    document.getElementById("turtleTrail").value = "";
}

//get turtle trail and draw
var goTurtle = function(ctx, turtle) {
    var turtleTrail = document.getElementById("turtleTrail").value
    if (turtleTrail.length > 0) {

        var commands = turtleTrail.split(/\n/);

        for (let i = 0; i < commands.length; i++) {
            var command = commands[i].split(" ");

            switch (command[0]) {
                case "position":
                    turtle.position(parseFloat(command[1]), parseFloat(command[2]));
                    break;
                case "move":
                    turtle.move(parseFloat(command[1]));
                    break;
                case "turn":
                    turtle.turn(parseFloat(command[1]));
                    break;
                case "color":
                    turtle.color(command[1]);
                    break;
                case "clear":
                    clearCanvas(ctx);
                    break;
                case "":
                    break;
                default:
                    alert("Nie ma takiej funkcji: " + command[0]);
            }
        }
    }
}

window.onload = function() {
    //get context
    let canvas = document.getElementById("canvas");
    let ctx = canvas.getContext("2d");

    //create turtle
    let turtle = new Turtle(0, 0, ctx, "black");

    document.getElementById("goButton").onclick = function() { goTurtle(ctx, turtle) };
}