let heading = document.createElement("h1");
heading.textContent = "Lennard-Jones Particle Simulation";
document.body.appendChild(heading);

let framerateText = document.createElement("h2");
framerateText.textContent = "";
document.body.appendChild(framerateText);

let canvas = document.createElement("canvas");
canvas.width = 640;
canvas.height = 640;
canvas.style.position = "absolute";
canvas.style.border = "1px solid";
document.body.appendChild(canvas);


class Renderer {
    _ctx: CanvasRenderingContext2D;
    width: number;
    height: number;

    constructor(canvas: HTMLCanvasElement) {
        let ctx = canvas.getContext("2d")
        if(ctx == null) {
            throw new Error("Failed to get 2D context")
        }
        this._ctx = ctx;
        this.width = canvas.width;
        this.height = canvas.height;
    }

    clear(): void {
        this._ctx.clearRect(0, 0, this.width, this.height);
    }

    drawCircle(x: number, y: number, r: number): void {
        this._ctx.beginPath();
        this._ctx.arc(x, y, r, 0, Math.PI*2);
        this._ctx.fillStyle = "#0095DD";
        this._ctx.fill();
        this._ctx.closePath();
    }
}


class Vector2d {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    magnitude(): number {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    addPartial(v2: Vector2d, h: number): void {
        this.x += v2.x * h;
        this.y += v2.y * h;
    }

}

type Particle = {
    position: Vector2d;
    velocity: Vector2d;
}

const BOX_SIZE = 16;
/*
function differencePeriodic(v1: Vector2d, v2: Vector2d): Vector2d {
    let delta = new Vector2d(Math.abs(v1.x - v2.x), Math.abs(v1.y - v2.y));

    if(delta.x > BOX_SIZE/2) {
        delta.x = BOX_SIZE - delta.x;
    }
    if(delta.y > BOX_SIZE/2) {
        delta.y = BOX_SIZE - delta.y;
    }

    return delta;
}
*/
function differencePeriodic(v1: Vector2d, v2: Vector2d): Vector2d {
    let delta = new Vector2d(v1.x - v2.x, v1.y - v2.y);

    if(delta.x > BOX_SIZE/2) {
        delta.x = delta.x - BOX_SIZE;
    } else if(delta.x < -BOX_SIZE/2) {
        delta.x = delta.x + BOX_SIZE;
    }
    if(delta.y > BOX_SIZE/2) {
        delta.y = delta.y - BOX_SIZE;
    } else if(delta.y < -BOX_SIZE/2) {
        delta.y = delta.y + BOX_SIZE;
    }

    return delta;
}

// Lennard-Jones potential approximation
function LJ_potential(r: number): number {
    let ratio = 4 / (3*r + 1);
    let ratio_3 = ratio*ratio*ratio;
    let ratio_6 = ratio_3*ratio_3;

    return 4 * (ratio_6*ratio_6 - ratio_6);
}
  
// Lennard-Jones force approximation
function LJ_force(r: number): number {
    let ratio = 4 / (3*r + 1);
    let ratio_3 = ratio*ratio*ratio;
    let ratio_6 = ratio_3*ratio_3;

    return 18 * (2*ratio_6*ratio_6 - ratio_6) * ratio;
}

// Integration method: https://arxiv.org/abs/cond-mat/0110585
const XI = 0.1786178958448091;
const LAM = -0.2123418310626054;
const CHI = -0.06626458266981849;

const C = [XI, CHI, 1-2*(CHI+XI), CHI, XI];
const D = [(1-2*LAM)/2, LAM, LAM, (1-2*LAM)/2];

function step(particles: Particle[], h: number): void {
    for(let i=0; i<particles.length; i++) {
        particles[i].position.addPartial(particles[i].velocity, C[0] * h);
    }
    for(let k=0; k<4; k++) {
        for(let i=0; i<particles.length; i++) {
            let acceleration = new Vector2d(0, 0);
            for(let j=0; j<particles.length; j++) {
                if(i != j) {
                    let delta = differencePeriodic(particles[i].position, particles[j].position);
                    let r = delta.magnitude();
                    let f = LJ_force(r);
                    acceleration.addPartial(delta, f / r);
                }
            }
            particles[i].velocity.addPartial(acceleration, D[k] * h);
        }
        for(let i=0; i<particles.length; i++) {
            particles[i].position.addPartial(particles[i].velocity, C[k+1] * h);
        }
    }
}

const SCALE = 40;

let renderer = new Renderer(canvas);

let particles: Particle[] = [];
particles.push({position: new Vector2d(5, 5), velocity: new Vector2d(1, 0)});
particles.push({position: new Vector2d(6, 6), velocity: new Vector2d(0, 0)});
particles.push({position: new Vector2d(10, 6), velocity: new Vector2d(0, 0)});
particles.push({position: new Vector2d(8, 8), velocity: new Vector2d(-1, 0)});

let lastTimestamp = 0;

function loop(timestamp: number) {
    let deltaTime = timestamp - lastTimestamp;
    lastTimestamp = timestamp;
    let framerate = 1000 / deltaTime;
    framerateText.textContent = framerate.toFixed(1) + " FPS"

    // Update
    for(let its=0; its<200; its++) {
        step(particles, 1e-4);

        for(let i=0; i<particles.length; i++) {
            if(particles[i].position.x < 0) particles[i].position.x += BOX_SIZE;
            if(particles[i].position.x > BOX_SIZE) particles[i].position.x -= BOX_SIZE;
            if(particles[i].position.y < 0) particles[i].position.y += BOX_SIZE;
            if(particles[i].position.y > BOX_SIZE) particles[i].position.y -= BOX_SIZE;
        }
    }

    // Draw
    renderer.clear();
    for(let i=0; i<particles.length; i++) {
        renderer.drawCircle(particles[i].position.x * SCALE, particles[i].position.y * SCALE, SCALE/2);
        
        if(particles[i].position.x < 1) {
            renderer.drawCircle((particles[i].position.x+BOX_SIZE) * SCALE, particles[i].position.y * SCALE, SCALE/2);
        }
        if(particles[i].position.x > BOX_SIZE-1) {
            renderer.drawCircle((particles[i].position.x-BOX_SIZE) * SCALE, particles[i].position.y * SCALE, SCALE/2);
        }
        if(particles[i].position.y < 1) {
            renderer.drawCircle(particles[i].position.x * SCALE, (particles[i].position.y+BOX_SIZE) * SCALE, SCALE/2);
        }
        if(particles[i].position.y > BOX_SIZE-1) {
            renderer.drawCircle(particles[i].position.x * SCALE, (particles[i].position.y-BOX_SIZE) * SCALE, SCALE/2);
        }
    }

    window.requestAnimationFrame(loop)
}

window.requestAnimationFrame(loop)
