var canvas;
canvas = document.getElementById('svg_canvas');
var dx;
var dy;

var systemCenter;

var coordSystem;

var cubeWorld;

var turtle3D;

var inclinationAngle;


//##############################################################################
//Model
class Cube {
    // center of cube, size of edge
    constructor(center, size) {
        const radius = size / 2;
        this.center = center;
        this.centerX = center.x;

        this.vertices = [
            new Point3D(center.x - radius, center.y - radius, center.z + radius),
            new Point3D(center.x - radius, center.y - radius, center.z - radius),
            new Point3D(center.x + radius, center.y - radius, center.z - radius),
            new Point3D(center.x + radius, center.y - radius, center.z + radius),
            new Point3D(center.x + radius, center.y + radius, center.z + radius),
            new Point3D(center.x + radius, center.y + radius, center.z - radius),
            new Point3D(center.x - radius, center.y + radius, center.z - radius),
            new Point3D(center.x - radius, center.y + radius, center.z + radius)
        ];

        this.edges = [
            [this.vertices[0], this.vertices[1]],
            [this.vertices[1], this.vertices[2]],
            [this.vertices[2], this.vertices[3]],
            [this.vertices[3], this.vertices[0]],
            [this.vertices[7], this.vertices[6]],
            [this.vertices[6], this.vertices[5]],
            [this.vertices[5], this.vertices[4]],
            [this.vertices[4], this.vertices[7]],
            [this.vertices[7], this.vertices[0]],
            [this.vertices[4], this.vertices[3]],
            [this.vertices[5], this.vertices[2]],
            [this.vertices[6], this.vertices[1]]
        ];
    }

    render() {
        for (let i = 0; i < this.edges.length; i++) {
            var begin = project(this.edges[i][0]);
            var end = project(this.edges[i][1]);
            canvas.innerHTML += line(begin.x + dx, begin.y + dy, end.x + dx, end.y + dy, 'black', '2px');
        }
    }
}

class Edge {
    constructor(start, end, col) {
        this.vertices = [
            start,
            end
        ];
        this.color = col;
    }

    render() {
        var begin = project(this.vertices[0]);
        var end = project(this.vertices[1]);
        canvas.innerHTML += line(begin.x + dx, begin.y + dy, end.x + dx, end.y + dy, this.color, '1px');
    }
}

class Point2D {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

class Point3D extends Point2D {
    constructor(x, y, z) {
        super(x, y);
        this.z = z;
    }
}

function line(x1, y1, x2, y2, color, width) {
    return '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 +
        '" style="stroke:' + color + ';stroke-width:' + width + '" />' + "\n";
};


//##############################################################################
//Fuctions
function project(vertex) {
    return new Point2D(vertex.x / (vertex.z / 1000), vertex.y / (vertex.z / 1000));
};

function rotate(vertice, center, theta_, phi_) {
    var ct = Math.cos(theta_),
        st = Math.sin(theta_),
        cp = Math.cos(phi_),
        sp = Math.sin(phi_),

        x = vertice.x - center.x,
        y = vertice.y - center.y,
        z = vertice.z - center.z;

    vertice.x = ct * x - st * cp * y + st * sp * z + center.x;
    vertice.y = st * x + ct * cp * y - ct * sp * z + center.y;
    vertice.z = sp * y + cp * z + center.z;

    return vertice
}

function inclination() {
    var begin = systemCenter,
        incEnd = coordSystem.xAxisEnd;

    inclinationAngle.x = Math.acos(incEnd.z / 150) * Math.PI / 360;
    inclinationAngle.y = Math.atan2(incEnd.y, incEnd.x) * Math.PI / 180;
}


//##############################################################################
//mouse events
var mouseDown;
var mouseCord = new Point2D(0, 0);

canvas.onmousedown = function(e) {
    mouseDown = true;
    mouseCord.x = e.clientX;
    mouseCord.y = e.clientY;
};

canvas.onmouseup = function(e) {
    mouseDown = false;
};
canvas.onmousemove = function(e) {
    if (mouseDown) {
        /**
         * theta w lewo maleje w prawo rosnie   
         * phi w góre maleje na dół rośnie
         */
        var theta = (e.clientX - mouseCord.x) * Math.PI / 360;
        var phi = (e.clientY - mouseCord.y) * Math.PI / 180;


        for (let i = 0; i < cubeWorld.vertices.length; i++) {
            cubeWorld.vertices[i] = rotate(cubeWorld.vertices[i], cubeWorld.center, theta, phi);
        }

        mouseCord.x = e.clientX;
        mouseCord.y = e.clientY;

        coordSystem.rotate(theta, phi);
        turtle3D.rotate(theta, phi);
        inclination();
        repaint();
    }
};

//##############################################################################
//Coordinate system
class Coordinates3D {
    constructor() {
        this.xAxisEnd = new Point3D(systemCenter.x + 150, systemCenter.y, systemCenter.z);
        this.yAxisEnd = new Point3D(systemCenter.x, systemCenter.y - 150, systemCenter.z);
        this.zAxisEnd = new Point3D(systemCenter.x, systemCenter.y, systemCenter.z + 150);
    }

    render() {
        var beg = project(systemCenter);
        var xend = project(this.xAxisEnd);
        canvas.innerHTML += line(beg.x + dx, beg.y + dy, xend.x + dx, xend.y + dy, 'red; stroke-opacity:0.15;', '5px');

        var yend = project(this.yAxisEnd);
        canvas.innerHTML += line(beg.x + dx, beg.y + dy, yend.x + dx, yend.y + dy, 'green; stroke-opacity:0.15;', '5px');

        var zend = project(this.zAxisEnd);
        canvas.innerHTML += line(beg.x + dx, beg.y + dy, zend.x + dx, zend.y + dy, 'blue; stroke-opacity:0.15;', '5px');
    };

    rotate(theta, phi) {
        this.xAxisEnd = rotate(this.xAxisEnd, systemCenter, theta, phi);
        this.yAxisEnd = rotate(this.yAxisEnd, systemCenter, theta, phi);
        this.zAxisEnd = rotate(this.zAxisEnd, systemCenter, theta, phi);
    };
};

//##############################################################################
//Turtle
class Turtle3D {
    constructor(position, color) {
        this.color = color;

        this.path = [];
        this.path[0] = position;
    }

    move(distance) {
        var position = this.path[this.path.length - 1];

        this.path.push(
            rotate(
                new Point3D(position.x + distance, position.y, position.z),
                systemCenter,
                inclinationAngle.x,
                inclinationAngle.y
            )
        );
    };

    render() {
        for (let i = 0; i < this.path.length - 1; i++) {

            var begin = project(this.path[i]);
            var end = project(this.path[i + 1]);
            canvas.innerHTML += line(begin.x + dx, begin.y + dy, end.x + dx, end.y + dy, this.color, '4px; stroke-opacity:0.8');
        }
    };

    rotate(theta, phi) {
        for (let i = 0; i < this.path.length; i++) {
            this.path[i] = rotate(this.path[i], cubeWorld.center, theta, phi);
        }
    };
};

//##############################################################################
//Onload
window.onload = function() {
    var rect = canvas.getBoundingClientRect();
    dx = rect.width / 2;
    dy = rect.height / 2;
    this.systemCenter = new Point3D(0, 0, 600);
    this.inclinationAngle = new Point2D(0, 0);
    this.coordSystem = new Coordinates3D();
    this.cubeWorld = new Cube(this.systemCenter, 300);
    this.turtle3D = new Turtle3D(this.systemCenter, "black");

    document.getElementById("goButton").onclick = function() { goTurtle() };
    this.repaint();
};

function repaint() {
    canvas.innerHTML = "";
    cubeWorld.render();
    coordSystem.render();
    turtle3D.render();
};


//##############################################################################
//turtle commands handler
var goTurtle = function() {
    var turtleTrail = document.getElementById("turtleTrail").value
    if (turtleTrail.length > 0) {

        var commands = turtleTrail.split(/\n/);

        for (let i = 0; i < commands.length; i++) {
            var command = commands[i].split(" ");

            switch (command[0]) {
                case "move":
                    turtle3D.move(parseFloat(command[1]));
                    break;
                case "":
                    break;
                default:
                    alert("Nie ma takiej funkcji: " + command[0]);
            }
        }
    }

    repaint();
}