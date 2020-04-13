let width, height;
let canvas, ctx;
let astar;
const TILE_SIZE = 15;

function createCanvas(w, h) {
	if (canvas) canvas.parentElement.removeChild(canvas);
	canvas = document.createElement('canvas');
	document.body.appendChild(canvas);
	ctx = canvas.getContext('2d');
	canvas.width = w;
	canvas.height = h;
	width = w;
	height = h;
}

function init() {
	const rows = 20;
	const cols = 20;

	const map = new Array(rows);
	for (let y = rows - 1; y >= 0; y--) {
		map[y] = new Array(cols);
		for (let x = cols - 1; x >= 0; x--) {
			map[y][x] = (Math.random() < 0.3) ? 1 : 0;
		}
	}

	astar = new AStar(map, rows, cols);
	createCanvas(astar.rows * TILE_SIZE, astar.cols * TILE_SIZE);
	const lastTime = performance.now();
	astar.findPath(19, 19, 0, 0);
	console.log(performance.now() - lastTime);
	render();
}

function render() {
	requestAnimationFrame(render);
	ctx.clearRect(0, 0, width, height);
	astar.draw();
}