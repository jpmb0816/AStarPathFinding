let width, height;
let canvas, ctx;
let astar;

const TILE_SIZE = 15;
const rows = 30;
const cols = 30;
const mouse = {
	x: 0,
	y: 0,
	ox: 0,
	oy: 0,
	clicked: function(evt) {
		const rect = canvas.getBoundingClientRect();
		mouse.ox = mouse.x;
		mouse.oy = mouse.y;
		mouse.x = Math.floor((evt.x - rect.left) / TILE_SIZE);
		mouse.y = Math.floor((evt.y - rect.top) / TILE_SIZE);
		astar.setStart(mouse.ox, mouse.oy);
		astar.setEnd(mouse.x, mouse.y);
		astar.init();
		astar.findPath();
	}
}
const map = new Array(rows);
for (let y = rows - 1; y >= 0; y--) {
	map[y] = new Array(cols);
	for (let x = cols - 1; x >= 0; x--) {
		map[y][x] = (Math.random() < 0.1) ? 1 : 0;
	}
}

function Node(x, y) {
	this.x = x;
	this.y = y;

	this.f = 0;
	this.g = 0;
	this.h = 0;

	this.parent = null;
	this.neighbors = new Array(4);
}

function AStar(map, rows, cols) {
	this.rows = rows;
	this.cols = cols;
	this.map = map
	this.grid = null;
	this.openSet = [];
	this.closedSet = [];
	this.resultPath = [];
	this.start = { x: 0, y: 0 };
	this.end = { x: 19, y: 19 };

	this.init = function() {
		this.grid = new Array(this.rows);
		const grid = this.grid;
		const rows = this.rows;
		const cols = this.cols;

		for (let y = rows - 1; y >= 0; y--) {
			grid[y] = new Array(cols);
			for (let x = cols - 1; x >= 0; x--) {
				grid[y][x] = new Node(x, y);
				this.addNeighbors(grid[y][x]);
			}
		}

		this.openSet = [];
		this.closedSet = [];
		this.resultPath = [];
		this.openSet.push(grid[this.start.y][this.start.x]);
	}

	this.draw = function() {
		this.drawMap();
		this.drawOpenSet();
		this.drawClosedSet();
		this.drawResultPath();
	};

	this.drawMap = function() {
		ctx.fillStyle = 'black';
		for (let y = this.rows - 1; y >= 0; y--) {
			for (let x = this.cols - 1; x >= 0; x--) {
				if (this.map[y][x]) ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
				else ctx.strokeRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
			}
		}
	};

	this.drawOpenSet = function() {
		ctx.fillStyle = 'yellow';
		this.openSet.forEach(e => {
			ctx.fillRect(e.x * TILE_SIZE, e.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
		});
	};

	this.drawClosedSet = function() {
		ctx.fillStyle = 'red';
		this.closedSet.forEach(e => {
			ctx.fillRect(e.x * TILE_SIZE, e.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
		});
	};

	this.drawResultPath = function() {
		ctx.fillStyle = 'green';
		this.resultPath.forEach(e => {
			ctx.fillRect(e.x * TILE_SIZE, e.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
		});
	};

	this.setStart = function(x, y) {
		this.start = { x: x, y: y };
	};

	this.setEnd = function(x, y) {
		this.end = { x: x, y: y };
	};

	this.heuristic = function(a, b) {
		return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
	};

	this.getIndexOfLowestFCost = function() {
		const openSet = this.openSet;
		let lowest = 0;

		for (let i = openSet.length - 1; i > 0; i--) {
			if (openSet[i].f < openSet[lowest].f) lowest = i;
			else if (openSet[i].f === openSet[lowest].f) {
				if (openSet[i].h < openSet[lowest].h) lowest = i;
			}
		}
		return lowest;
	};

	this.addNeighbors = function(node) {
		const left = node.x - 1;
		const right = node.x + 1;
		const up = node.y - 1;
		const down = node.y + 1;

		if (left >= 0) node.neighbors[0] = ({ x: left, y: node.y });
		if (right < this.rows) node.neighbors[1] = ({ x: right, y: node.y });
		if (up >= 0) node.neighbors[2] = ({ x: node.x, y: up });
		if (down < this.cols) node.neighbors[3] = ({ x: node.x, y: down });
	};

	this.removeFromOpenList = function(node) {
		const openSet = this.openSet;
		for (let i = openSet.length - 1; i >= 0; i--) {
			if (openSet[i] === node) return openSet.splice(i, 1);
		}
	};

	this.findPath = function() {
		const openSet = this.openSet;
		const closedSet = this.closedSet;
		const resultPath = this.resultPath;
		const start = this.start;
		const end = this.end;
		const map = this.map;
		const grid = this.grid;

		while (openSet.length && !resultPath.length) {
			const current = openSet[this.getIndexOfLowestFCost()];

			if (current === grid[end.y][end.x]) {
				let temp = current;
				resultPath.push(current);

				while (temp.parent) {
					resultPath.push(temp.parent);
					temp = temp.parent;
				}
				return;
			}

			this.removeFromOpenList(current);
			closedSet.push(current);
			const neighbors = current.neighbors;

			for (let i = neighbors.length - 1; i >= 0; i--) {
				if (neighbors[i]) {
					const neighbor = grid[neighbors[i].y][neighbors[i].x];

					if (!map[neighbor.y][neighbor.x] && !closedSet.includes(neighbor)) {
						let tempG = current.g + 1;
						let hasNewPath = false;

						if (openSet.includes(neighbor)) {
							if (tempG < neighbor.g) {
								hasNewPath = true;
							}
						}
						else {
							neighbor.g = tempG;
							openSet.push(neighbor);
							hasNewPath = true;
						}

						if (hasNewPath) {
							neighbor.h = this.heuristic(neighbor, end);
							neighbor.f = neighbor.g + neighbor.h;
							neighbor.parent = current;
						}
					}
				}
			}
		}
	};
}

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
	astar = new AStar(map, rows, cols);
	createCanvas(astar.rows * TILE_SIZE, astar.cols * TILE_SIZE);
	canvas.addEventListener('click', mouse.clicked);
	render();
}

function render() {
	requestAnimationFrame(render);
	ctx.clearRect(0, 0, width, height);
	astar.draw();
}