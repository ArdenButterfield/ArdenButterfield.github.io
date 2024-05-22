
function setup() {
    createCanvas(windowWidth, windowHeight);
}

const STEP = 40;
const INCR = 0.3;
let progression = 0;
const SQUARE_SIZE = 250;
function draw() {
    background('tan');
    fill('brown');
    noStroke();
    circlesize = (1 + Math.cos((progression / STEP) * Math.PI * 2) * 0.5) * 15;
    // warp
    for (let x = -20; x < width + 20; x += STEP) {
        for (let y = -20; y < height + 20; y += STEP) {
            if (x % (2 * SQUARE_SIZE) > SQUARE_SIZE) {
                ellipse(x - (STEP / 2), y + progression - (STEP / 2), circlesize, circlesize);
            } else {
                ellipse(x, y + progression, circlesize, circlesize);

            }
        }
    }

    // weft
    fill('black');

    for (let x = -20; x < width + 20; x += STEP) {
        for (let y = -20; y < height + 20; y += STEP) {
            if (y % (2 * SQUARE_SIZE) > SQUARE_SIZE) {
                ellipse(x + progression, y - (STEP / 2), circlesize, circlesize);
            } else {
                ellipse(x + progression - (STEP / 2), y, circlesize, circlesize);

            }
        }
    }

    progression += INCR;
    progression %= STEP;
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}
