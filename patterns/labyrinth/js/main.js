const UNIT = 20

function setup() {
    createCanvas(windowWidth, windowHeight);
}

function drawCorner(center, rotation) {
    strokeWeight(4);
    arc(center.x, center.y, UNIT * 2, UNIT * 2, PI / 2 + rotation, PI * 3/2 + rotation);
    arc(center.x, center.y, UNIT * 4, UNIT * 4, PI / 2 + rotation, PI * 3/2 + rotation);
}

function draw() {
    background('tan');
    fill('brown');
    noFill();
    i = 0;
    for (let x = 0; x < width + UNIT * 4; x += UNIT * 4 * Math.sin(PI / 3)) {
        yStart = (UNIT + UNIT * 4 * Math.cos(PI/3)) * i;
        while (yStart > 0) {
            yStart -= UNIT * 4;
        }
        for (let y = yStart; y < height + UNIT * 4; y += UNIT * 4) {
            drawCorner(createVector(x, y), 0);
            drawCorner(createVector(x, y + UNIT), PI);
        }
        ++i;
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}
