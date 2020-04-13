class AStar {
	constructor (map, rows, cols) {
		this.rows = rows;
		this.cols = cols;
		this.map = map;
		this.gridBackup = new Array(rows);
		this.openSet = [];
		this.closedSet = [];
		this.resultPath = [];

		for (let y = rows - 1; y >= 0; y--) {
			this.gridBackup[y] = new Array(cols);
			for (let x = cols - 1; x >= 0; x--) {
				this.gridBackup[y][x] = new Node(x, y);
				this.addNeighbors(this.gridBackup[y][x]);
			}
		}
		this.grid = JSON.parse(JSON.stringify(this.gridBackup));
	}

	draw() {
		this.drawMap();
		this.drawOpenSet();
		this.drawClosedSet();
		this.drawResultPath();
	}

	drawMap() {
		ctx.fillStyle = 'black';
		for (let y = this.rows - 1; y >= 0; y--) {
			for (let x = this.cols - 1; x >= 0; x--) {
				if (this.map[y][x]) ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
				else ctx.strokeRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
			}
		}
	}

	drawOpenSet() {
		ctx.fillStyle = 'yellow';
		this.openSet.forEach(e => {
			ctx.fillRect(e.x * TILE_SIZE, e.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
		});
	}

	drawClosedSet() {
		ctx.fillStyle = 'red';
		this.closedSet.forEach(e => {
			ctx.fillRect(e.x * TILE_SIZE, e.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
		});
	}

	drawResultPath() {
		ctx.fillStyle = 'green';
		this.resultPath.forEach(e => {
			ctx.fillRect(e.x * TILE_SIZE, e.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
		});
	}

	manhattanDistance(a, b) {
		return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
	}

	getNodeOfLowestFCost() {
		let lowest = this.openSet[0];

		this.openSet.forEach(node => {
			if (node.f < lowest.f) lowest = node;
			else if (node.f === lowest.f) {
				if (node.h < lowest.h) lowest = node;
			}
		});
		return lowest;
	}

	addNeighbors(node) {
		const left = node.x - 1;
		const right = node.x + 1;
		const up = node.y - 1;
		const down = node.y + 1;

		if (left >= 0) node.neighbors[0] = ({ x: left, y: node.y });
		if (right < this.rows) node.neighbors[1] = ({ x: right, y: node.y });
		if (up >= 0) node.neighbors[2] = ({ x: node.x, y: up });
		if (down < this.cols) node.neighbors[3] = ({ x: node.x, y: down });
	}

	removeFromOpenList(node) {
		const openSet = this.openSet;
		for (let i = openSet.length - 1; i >= 0; i--) {
			if (openSet[i] === node) return openSet.splice(i, 1);
		}
	}

	findPath(sx, sy, ex, ey) {
		this.grid = JSON.parse(JSON.stringify(this.gridBackup));
		this.openSet = [];
		this.closedSet = [];
		this.resultPath = [];

		const openSet = this.openSet;
		const closedSet = this.closedSet;
		const resultPath = this.resultPath;
		const end = { x: ex, y: ey };
		const map = this.map;
		const grid = this.grid;
		this.openSet.push(grid[sy][sx]);

		while (openSet.length && !resultPath.length) {
			let current = this.getNodeOfLowestFCost();

			if (current === grid[ey][ex]) {
				resultPath.push({ x: current.x, y: current.y });

				while (current.parent) {
					const parent = current.parent;
					resultPath.push({ x: parent.x, y: parent.y });
					current = parent;
				}
				return;
			}

			this.removeFromOpenList(current);
			closedSet.push(current);

			current.neighbors.forEach(nPos => {
				if (nPos) {
					const neighbor = grid[nPos.y][nPos.x];

					if (!map[neighbor.y][neighbor.x] && !closedSet.includes(neighbor)) {
						let tempG = current.g + 1;
						let hasNewPath = false;

						if (openSet.includes(neighbor)) {
							if (tempG < neighbor.g) hasNewPath = true;
						}
						else {
							neighbor.g = tempG;
							openSet.push(neighbor);
							hasNewPath = true;
						}

						if (hasNewPath) {
							neighbor.h = this.manhattanDistance(neighbor, end);
							neighbor.f = neighbor.g + neighbor.h;
							neighbor.parent = current;
						}
					}
				}
			});
		}
	}
}