class Node {
	constructor(x, y) {
		this.x = x;
		this.y = y;

		this.f = 0;
		this.g = 0;
		this.h = 0;

		this.parent = null;
		this.neighbors = new Array(4);
	}
}