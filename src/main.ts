let heading = document.createElement("h1");
heading.textContent = "Lennard-Jones Particle Simulation";
document.body.appendChild(heading);

let canvas = document.createElement("canvas");
canvas.width = 640;
canvas.height = 640;
canvas.style.position = "absolute";
canvas.style.border = "1px solid";
document.body.appendChild(canvas);


class Renderer {
    _ctx: CanvasRenderingContext2D;

    constructor(canvas: HTMLCanvasElement) {
        let ctx = canvas.getContext("2d")
        if(ctx == null) {
            throw new Error("Failed to get 2D context")
        }
        this._ctx = ctx;
    }

    drawCircle(x: number, y: number, r: number) {
        this._ctx.beginPath();
        this._ctx.arc(x, y, r, 0, Math.PI*2);
        this._ctx.fillStyle = "#0095DD";
        this._ctx.fill();
        this._ctx.closePath();
    }
}


let renderer = new Renderer(canvas);
renderer.drawCircle(200, 200, 25)