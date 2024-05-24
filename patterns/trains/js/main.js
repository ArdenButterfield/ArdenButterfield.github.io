
let arcCenter;
function setup() {
    createCanvas(windowWidth, windowHeight);
    arcCenter = createVector(width * 1/7, height * 3/4);

    numTracksSlider = createSlider(1, 8);
    numTracksSlider.position(10, 10);
    numTracksSlider.size(80);

    numTrainsSlider = createSlider(1, 80);
    numTrainsSlider.position(10, 30);
    numTrainsSlider.size(80);

    bulletFrequencySlider = createSlider(1, 30);
    bulletFrequencySlider.position(10, 50);
    bulletFrequencySlider.size(80);

    trainSpeedSlider = createSlider(1, 100);
    trainSpeedSlider.position(10, 70);
    trainSpeedSlider.size(80);

    bulletSpeedSlider = createSlider(1, 100);
    bulletSpeedSlider.position(10, 90);
    bulletSpeedSlider.size(80);
}

let bullets = [];

function advanceBullets() {
    for (let bullet of bullets) {
        bullet.position.add(bullet.velocity);
    }
    for (let i = bullets.length - 1; i >= 0; --i) {
        const p = bullets[i].position;
        if (p.x < -width || p.y < -height || p.x > 2 * width || p.y > 2 * height) {
            bullets.splice(i, 1);
        }
    }
}

function draw() {

    noFill();

    tracks = []
    for (i = 0; i < numTracksSlider.value(); i++) {
        tracks.push(400 - i * 50);
    }

    background('tan');
    for (const arcRadius of tracks) {
        stroke('black');
        strokeWeight(4);
        ellipse(arcCenter.x, arcCenter.y, arcRadius * 2, arcRadius * 2);
        const NUM_TRAINS = numTrainsSlider.value();
        for (let i = 0; i < NUM_TRAINS; ++i) {
            let trainAngle = (((frameCount * trainSpeedSlider.value() / 50 / (arcRadius * 4)) + i / NUM_TRAINS) % 1) * 2 * PI;
            trainPos = createVector(0, -arcRadius);
            trainPos.rotate(trainAngle);
            trainPos.add(arcCenter);



            if ((frameCount % bulletFrequencySlider.value()) === 0) {
                let v = createVector(4 * bulletSpeedSlider.value() / 30, -2 * bulletSpeedSlider.value() / 30/*Math.sin(frameCount / 200) * 2 - 2*/);
                v.rotate(trainAngle);
                bullets.push({position: trainPos.copy(), velocity: v});
                console.log(bullets[0].position.x)
            }

            stroke('red')
            ellipse(trainPos.x, trainPos.y, 20, 20);

        }
    }





    stroke('brown');
    fill('tan')
    for (const b of bullets) {
        ellipse(b.position.x, b.position.y, 10, 10);
    }

    advanceBullets();
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    arcCenter = createVector(width * 1/4, height * 3/4);
}

function doubleClicked() {
    bullets = [];
}