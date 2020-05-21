const maxX = 100;
const minX = -100;
const maxY = 100;
const minY = -100;

class Turtle {
    constructor(actX, actY, color, svg) {
        this.svg = svg.getBoundingClientRect();
        this.color = color;
        this.actX = actX;
        this.actY = actY;
        this.angle = 0;
        this.path = "";
    }

    //coordinates conversion
    canvasX = function(x) {
        return (x - minX) / (maxX - minX) * (this.svg.width);
    }
    canvasY = function(y) {
        return this.svg.height - (y - minY) / (maxY - minY) * (this.svg.height);
    }

    position = function(x, y) {
        this.actX = x;
        this.actY = y;
    }

    line = function(x1, y1, x2, y2) {
        return '<line x1="' + parseFloat(x1) + '" y1="' + parseFloat(y1) + '" x2="' + parseFloat(x2) + '" y2="' + parseFloat(y2) +
            '" style="stroke:' + this.color + ';stroke-width:' + 1 + '" />' + "\n";
    }

    move = function(distance) {
        let x1 = this.actX;
        let y1 = this.actY;
        this.actX = this.actX + Math.sin(this.angle * Math.PI / 180) * distance;
        this.actY = this.actY + Math.cos(this.angle * Math.PI / 180) * distance;
        this.path += this.line(this.canvasX(x1), this.canvasY(y1), this.canvasX(this.actX), this.canvasY(this.actY));
    }

    turn = function(angle) {
        this.angle += angle;
        angle %= 360;
    }
};

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
    let svg = document.querySelector('#hilbertSvg');
    svg.innerHTML = '<g id="myGroup"></g>';

    var myGroup = document.querySelector('#myGroup');

    document.getElementById("drawButton").onclick = function() {
        myGroup.innerHTML = "";
        var deg = document.getElementById("crDeg").value;
        var turtle = new Turtle(-90, -90, "black", svg);
        hilbertCurve(turtle, Math.pow(1 / 2, deg), deg, 90);
        myGroup.innerHTML += turtle.path;
    };
}