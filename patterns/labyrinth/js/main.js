const UNIT = 20
const EPS = 0.1
function setup() {
    createCanvas(windowWidth, windowHeight);
}

function drawCorner(center, rotation) {
    strokeWeight(4);
    arc(center.x, center.y, UNIT * 4, UNIT * 4, PI / 2 + rotation - EPS, PI * 3/2 + rotation + EPS);
    arc(center.x, center.y, UNIT * 2, UNIT * 2, PI / 2 + rotation - EPS, PI * 3/2 + rotation + EPS);
}

function draw() {
    background('black');
    fill('brown');
    i = 0;
    for (let x = 0; x < width + UNIT * 4; x += UNIT * 4 * Math.sin(PI / 3)) {
        yStart = (UNIT + UNIT * 4 * Math.cos(PI/3)) * i + frameCount;
        while (yStart > 0) {
            yStart -= UNIT * 4;
        }
        for (let y = yStart; y < height + UNIT * 4; y += UNIT * 4) {
            dist = Math.sqrt((x - mouseX) * (x - mouseX) + (y - mouseY) * (y - mouseY));
            proportion = 1 - Math.tanh(dist / 1000);
            fill(255 * proportion, 255 * proportion, 200 * proportion)
            drawCorner(createVector(x, y), 0);
            drawCorner(createVector(x, y + UNIT), PI);
        }
        ++i;
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}
