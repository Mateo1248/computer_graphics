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

let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

//spiral    
let T3 = new Turtle(0, 0, ctx, "yellow");

for (x = 5; x <= 190; x += 5) {
    T3.move(x);
    T3.turn(90);
}

//square
let T2 = new Turtle(-59.8, 0.3, ctx, "green")

T2.turn(45);
for (x = 1; x <= 4; x++) {
    T2.move(80.8);
    T2.turn(90);
}

//hexagon
let T4 = new Turtle(-60.2, 0.3, ctx, "violet");

T4.turn(30);
for (x = 0; x < 6; x++) {
    T4.move(57.5);
    T4.turn(60);
}

//circle
let T1 = new Turtle(-60, 0, ctx, "red")

for (x = 1; x <= 360; x++) {
    T1.move(1);
    T1.turn(1);
}