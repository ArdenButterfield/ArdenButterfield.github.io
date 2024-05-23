const RADIUS = 50;
let STARTPOINT;
let bullets = [];

function makeBullets() {
    bullets.push({
        center: createVector(STARTPOINT.x - RADIUS, STARTPOINT.y),
        arm: createVector(RADIUS, 0),
        clockwise: true
    });
    bullets.push({
        center: createVector(STARTPOINT.x - RADIUS, STARTPOINT.y),
        arm: createVector(RADIUS, 0),
        clockwise: false
    });
    bullets.push({
        center: createVector(STARTPOINT.x + RADIUS, STARTPOINT.y),
        arm: createVector(-RADIUS, 0),
        clockwise: true
    });
    bullets.push({
        center: createVector(STARTPOINT.x + RADIUS, STARTPOINT.y),
        arm: createVector(-RADIUS, 0),
        clockwise: false
    });
    bullets.push({
        center: createVector(STARTPOINT.x + RADIUS * Math.cos(PI / 3), STARTPOINT.y + RADIUS * Math.sin(PI / 3)),
        arm: createVector(-RADIUS * Math.cos(PI / 3), RADIUS * -Math.sin(PI / 3)),
        clockwise: false
    });
    bullets.push({
        center: createVector(STARTPOINT.x + RADIUS * Math.cos(PI / 3), STARTPOINT.y + RADIUS * Math.sin(PI / 3)),
        arm: createVector(-RADIUS * Math.cos(PI / 3), RADIUS * -Math.sin(PI / 3)),
        clockwise: true
    });
    bullets.push({
        center: createVector(STARTPOINT.x - RADIUS * Math.cos(PI / 3), STARTPOINT.y + RADIUS * Math.sin(PI / 3)),
        arm: createVector(RADIUS * Math.cos(PI / 3), RADIUS * -Math.sin(PI / 3)),
        clockwise: false
    });
    bullets.push({
        center: createVector(STARTPOINT.x - RADIUS * Math.cos(PI / 3), STARTPOINT.y + RADIUS * Math.sin(PI / 3)),
        arm: createVector(RADIUS * Math.cos(PI / 3), RADIUS * -Math.sin(PI / 3)),
        clockwise: true
    });
    bullets.push({
        center: createVector(STARTPOINT.x - RADIUS * Math.cos(PI / 3), STARTPOINT.y - RADIUS * Math.sin(PI / 3)),
        arm: createVector(RADIUS * Math.cos(PI / 3), RADIUS * Math.sin(PI / 3)),
        clockwise: false
    });
    bullets.push({
        center: createVector(STARTPOINT.x - RADIUS * Math.cos(PI / 3), STARTPOINT.y - RADIUS * Math.sin(PI / 3)),
        arm: createVector(RADIUS * Math.cos(PI / 3), RADIUS * Math.sin(PI / 3)),
        clockwise: true
    });
    bullets.push({
        center: createVector(STARTPOINT.x + RADIUS * Math.cos(PI / 3), STARTPOINT.y - RADIUS * Math.sin(PI / 3)),
        arm: createVector(-RADIUS * Math.cos(PI / 3), RADIUS * Math.sin(PI / 3)),
        clockwise: false
    });
    bullets.push({
        center: createVector(STARTPOINT.x + RADIUS * Math.cos(PI / 3), STARTPOINT.y - RADIUS * Math.sin(PI / 3)),
        arm: createVector(-RADIUS * Math.cos(PI / 3), RADIUS * Math.sin(PI / 3)),
        clockwise: true
    });

}

function setup() {
    createCanvas(windowWidth, windowHeight);
    STARTPOINT = createVector(Math.round(width / (2 * RADIUS)) * RADIUS, 4 * RADIUS * Math.sin(PI/3));
    makeBullets();
}

function mouseClicked() {
    makeBullets();
}

function draw() {
    for (let b of bullets) {
        if (b.clockwise) {
            b.arm.rotate(Math.PI / 60);
        } else {
            b.arm.rotate(-Math.PI / 60);
        }
        for (let dir = 0; dir < 2 * Math.PI; dir += Math.PI / 3) {
            let normalizedHeading = (b.arm.heading() + 2 * Math.PI) % (2 * Math.PI);
            if ((Math.random() < 0.8) && (Math.abs(normalizedHeading - dir) < 0.01)) {
                b.arm.setHeading(dir);
                let possibleNewCenter = b.center.copy();
                possibleNewCenter.add(b.arm);
                possibleNewCenter.add(b.arm);

                if (possibleNewCenter.dist(createVector(mouseX, mouseY)) < b.center.dist(createVector(mouseX, mouseY))) {
                    b.center = possibleNewCenter;
                    b.arm.rotate(Math.PI);
                    b.clockwise = !b.clockwise;

                }

            }
        }
    }


    background('black');
    stroke('gray');
    noFill();
    i = 0;
    strokeWeight(1);
    for (let y = 0; y < height + RADIUS; y += RADIUS * Math.sin(PI / 3)) {
        xStart = i % 2 ? RADIUS * Math.cos(PI / 3) : 0;
        for (let x = xStart; x < width + RADIUS; x += RADIUS) {
            stroke('gray');

            for (const b of bullets) {
                if (Math.abs(b.center.x - x) < 1 && Math.abs(b.center.y - y) < 1) {
                    stroke('green');
                }
            }
            ellipse(x, y, RADIUS * 2, RADIUS * 2);
        }
        i++;
    }
    strokeWeight(10);
    point(STARTPOINT);
    stroke('yellow');
    for (const b of bullets) {
        let pos = b.center.copy();
        pos.add(b.arm);
        point(pos);
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}
