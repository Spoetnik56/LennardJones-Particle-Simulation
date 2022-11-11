var heading = document.createElement("h1");
heading.textContent = "Lennard-Jones Particle Simulation";
document.body.appendChild(heading);
var canvas = document.createElement("canvas");
canvas.width = 640;
canvas.height = 640;
canvas.style.position = "absolute";
canvas.style.border = "1px solid";
document.body.appendChild(canvas);
var Renderer = /** @class */ (function () {
    function Renderer(canvas) {
        var ctx = canvas.getContext("2d");
        if (ctx == null) {
            throw new Error("Failed to get 2D context");
        }
        this._ctx = ctx;
    }
    Renderer.prototype.drawCircle = function (x, y, r) {
        this._ctx.beginPath();
        this._ctx.arc(x, y, r, 0, Math.PI * 2);
        this._ctx.fillStyle = "#0095DD";
        this._ctx.fill();
        this._ctx.closePath();
    };
    return Renderer;
}());
var renderer = new Renderer(canvas);
renderer.drawCircle(200, 200, 25);
