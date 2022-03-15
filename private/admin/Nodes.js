/*
 * POSITION CLASS
 */

class Pos {
	constructor(x, y) {
		this.x = x;
		this.y = y;
	}
	set(x, y) {
		this.x = x;
		this.y = y;
	}

	// takes another position and returns the distance between this position
	// and the other position
	distance(other) {
		return Math.sqrt(
			Math.pow(this.x - other.x, 2) + Math.pow(this.y - other.y, 2));
	}
}

/*
 * NODE CLASS
 */

class Node {
	constructor(pos) {
		this.energy = parameters.ine; // at the start the energy is the initial_energy
		this.pos = pos; // position of the node on the canvas (x,y)

		// an array that holds the numbers of the rounds that this node
		// has been a cluster head.
		// Ex: [1,2,6,9] means that this node has been a cluster head in rounds 1,2,3,6 and 9
		// this will help calculating the times that
		// this node has been a cluster head in the last Nth rounds
		// Ex: If we need to know if this node has been a cluster head in the last 20 rounds
		// we can simply check if any number between 1 and 20 is in the array, if there is,
		// then this node has been a cluster head in the last 20 rounds at least once,
		// otherwise it hasn't
		this.rounds_been_ch = [];
	}

	// takes the number of the current round, and returns wether the node
	// is a cluster head in this round
	isCH(currentRound) {
		return this.rounds_been_ch.includes(currentRound);
	}

	//makes the node a cluster head
	//takes the current rouund number
	makeCH(currentRound) {
		this.rounds_been_ch.push(currentRound);
	}

	// returns true if the node is still alive
	// otherwise returns false
	isLive() {
		return this.energy > 0;
	}

	// checks if the node has been a cluster head in the last Nth rounds
	// takes N (last N rounds) and r (current round)
	// returns true or false
	hasBeenCH(n, r) {
		return this.rounds_been_ch.filter((round) => round >= r - n).length > 0;
	}

	static fromObject({ pos, energy, rounds_been_ch }) {
		const node = new Node(new Pos(pos.x, pos.y));
		node.energy = energy;
		node.rounds_been_ch = rounds_been_ch;
		return node;
	}
}

/*
 * CLUSTER CLASS
 */

class Cluster {
	constructor(nodes) {
		this.nodes = nodes;
	}

	// get cluster head for current round
	// takes current round (r) and returns a Node or null if there is no CH
	getCH() {
		return this.nodes[0] || null;
	}

	// adds a node to the cluster
	addNode(node) {
		this.nodes.push(node);
	}
}

/*
 * BASESTATION CLASS
 */

class BaseStation {
	// takes a position
	constructor(pos) {
		this.pos = pos;
	}
}
