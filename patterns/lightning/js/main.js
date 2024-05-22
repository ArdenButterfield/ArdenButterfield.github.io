const SEGMENT_LENGTH = 4;
let visited_points = [];
let end_points = [];
let lines = [];
const NUM_REAL_LINES = 1000;
let split_prob = 0.1;

function setup() {
    createCanvas(windowWidth, windowHeight);
    visited_points = [];
    end_points = [];
    end_points.push([createVector(width / 2, height / 2), createVector(SEGMENT_LENGTH,0)]);
}

function advance(point, isBranch) {
    let next_point = [point[0].copy(), point[1].copy()];
    if (isBranch) {
        let angle = Math.random() + 1;
        if (Math.random() > 0.5) {
            angle *= -1;
        }
        next_point[1].rotate(angle);
    } else {
        next_point[1].rotate((Math.random() - 0.5) * 0.5);
    }
    next_point[0] = next_point[0].add(next_point[1]);
    return next_point;
}

function farEnoughAway(point) {
    if (point[0].x < 0 || point[0].y < 0 || point[0].x > width || point[0].y > height) {
        return false;
    }
    for (let i = visited_points.length - 1; i >= 0 && i >= visited_points.length - NUM_REAL_LINES; --i) {
        if (visited_points[i][0].dist(point[0]) < SEGMENT_LENGTH) {
            return false;
        }

    }
    return true;
}

function draw() {
    let next_points = []
    for (const pt of end_points) {
        let next = advance(pt, false);
        if (farEnoughAway(next)) {
            lines.push([pt[0], next[0]]);
            next_points.push(next);
        }
        if (Math.random() < split_prob) {
            let next = advance(pt, true);
            if (farEnoughAway(next)) {
                lines.push([pt[0], next[0]]);
                next_points.push(next);
            }
        }
        visited_points.push(pt);
    }
    end_points = next_points;

    background("tan");

    a = NUM_REAL_LINES
    for (let i = lines.length - 1; i >= 0 && i >= visited_points.length - NUM_REAL_LINES; --i) {
        let l = lines[i];
        stroke(0,0,0,255 * a / NUM_REAL_LINES);
        line(l[0].x, l[0].y ,l[1].x, l[1].y);
        a--;
    }
    if (lines.length > NUM_REAL_LINES) {
        // if (Math.random() < 1) {
        //     end_points.pop();
        // }
        while (end_points.length > 100) {
            end_points.pop();
        }

    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}
