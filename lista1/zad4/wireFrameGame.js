var canvas;
var dx;
var dy;
var cubes = [];
var map = [];
var camera;

onkeypress = onKeyPressed;


//##############################################################################
//Model
class Cube {
    // center of cube, size of edge
    constructor(center, size) {
        const radius = size / 2;
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


//##############################################################################
//Controller
function onKeyPressed(e) {
    // prevents browser from interpreting the keys
    e.preventDefault();

    const code = e.which || e.keyCode;


    switch (code) {
        case 119: // W
            move('up');
            repaint();
            break;
        case 97: // A
            move('left');
            repaint();
            break;
        case 100: // D
            move('right');
            repaint();
            break;
    };
};

function move(val) {
    switch (val) {
        case 'up':
            console.log("up");

            let colision = false;
            for (let i = 0; i < cubes.length; i++) {

                if (cubes[i].vertices[0].z < 20 && 0 == cubes[i].centerX) {
                    colision = true;
                    break;
                }
            }

            if (!colision) {
                for (let i = 0; i < cubes.length; i++) {
                    for (let j = 0; j < cubes[i].vertices.length; j++) {
                        cubes[i].vertices[j].z -= 10;
                    }

                    if (cubes[i].vertices[0].z < 10) {
                        var size = 10;
                        var x;
                        var rand = Math.floor(Math.random() * 10) % 3;
                        if (rand == 0) {
                            x = 0;
                        } else if (rand == 1) {
                            x = 10;
                        } else {
                            x = -10
                        }
                        var y = 0;
                        var z = 1000;
                        cubes[i] = new Cube(new Point3D(x, y, z), size);
                    }
                }
            }
            break;

        case 'left':
            console.log("left");
            for (let i = 0; i < cubes.length; i++) {
                cubes[i].centerX += 10;
                for (let j = 0; j < cubes[i].vertices.length; j++) {
                    cubes[i].vertices[j].x += 10;
                }
            }

            camera.x -= 10;
            break;

        case 'right':
            console.log("right");
            for (let i = 0; i < cubes.length; i++) {
                cubes[i].centerX -= 10;
                for (let j = 0; j < cubes[i].vertices.length; j++) {
                    cubes[i].vertices[j].x -= 10;
                }
            }

            camera.x += 10;
            break;
    }
};

function repaint() {
    canvas.innerHTML = "";

    renderPaths();
    renderCubes();
}

function generatePaths() {
    paths = [
        new Edge(new Point3D(5, 5, 1000), new Point3D(5, 5, 10), "black"),
        new Edge(new Point3D(-5, 5, 1000), new Point3D(-5, 5, 10), "black"),
        new Edge(new Point3D(15, 5, 1000), new Point3D(15, 5, 10), "black"),
        new Edge(new Point3D(-15, 5, 1000), new Point3D(-15, 5, 10), "black"),
        new Edge(new Point3D(25, 5, 1000), new Point3D(25, 5, 10), "black"),
        new Edge(new Point3D(-25, 5, 1000), new Point3D(-25, 5, 10), "black"),
        new Edge(new Point3D(-1000, 5, 1000), new Point3D(1000, 5, 1000), "black")
    ];
}

function renderPaths() {
    for (let i = 0; i < paths.length; i++) {
        paths[i].render();
    }
}

function generateCubes() {
    cubesQuan = 5;
    var cubes = [cubesQuan];
    for (let i = 0; i < cubesQuan; i++) {
        // Math.random() * (max - min) + min
        var size = 10;
        var x;
        var rand = Math.floor(Math.random() * 10) % 3;
        if (rand == 0) {
            x = 0;
        } else if (rand == 1) {
            x = 10;
        } else {
            x = -10
        }
        var y = 0;
        var z = 1050 - (i + 1) * 200;
        cubes[i] = new Cube(new Point3D(x, y, z), size);
    }

    return cubes;
}

function renderCubes() {
    for (let i = 0; i < cubes.length; i++) {
        cubes[i].render();
    }
}

function line(x1, y1, x2, y2, color, width) {
    return '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 +
        '" style="stroke:' + color + ';stroke-width:' + width + '" />' + "\n";
};

function project(vertex) {
    return new Point2D(vertex.x / (vertex.z / 1000), vertex.y / (vertex.z / 1000));
};

//##############################################################################
//Onload
window.onload = function() {
    canvas = document.getElementById('svg_canvas');
    dx = canvas.attributes.width.value / 2;
    dy = canvas.attributes.height.value / 2;
    camera = new Point3D(0, 0, 0);

    cubes = generateCubes();
    generatePaths();
    repaint();
};