var parameters = {
	dpe: 50e-9,
	tefp: 10e-12,
	tempp: 0.0013e-12,
	ecda: 5e-9,
	ine: 2,
	ri: 1 * (60 * 60),
	cri: 1 * (60 * 60 * 24 * 7),
	ps: 200,
	maxi: 20,
	sc: 0.001,
	rate: 1 * Math.pow(10, 6), // bits per second example here 1 mb/s
	simRate: 2000
};

var rdata = {};

var CR = 1; // current round
var CRF = 1; // current frame
var P = 0.05; // probability of election
var simulation_running = false; // check if simulation is running
var NoNodes = 100; // number of nodes to start initially if no nodes manually placed
var minnodes = 5; // minimum number of nodes, if less than this start initializing at random positions
var nodes = []; // nodes array including (cluster heads / members / dead nodes)
var clusters = []; // array of clusters
var BS = new BaseStation(new Pos(50, 50)); // the main base station in the center
chart.addByCoord(BS.pos.x, BS.pos.y, "bs");
chart.update();

function T(node) {
	// console.log({node,hasbeench: node.hasBeenCH(Math.floor(1 / P), CR)});
	if (!node.hasBeenCH(Math.floor(1 / P), CR)) {
		return (P / (1 - P * (CR % (1 / P))));
	} else {
		return 0;
	}
}

function check() {
	let live = nodes.filter(n => n.isLive());
	return live.filter(n => n.hasBeenCH(Math.floor(1 / P), CR)).length == live.length;
}
let count = 0;
function elect() {
	clusters = [];
	// console.log("ELECT FUNCTION");
	while (clusters.length == 0) {

		// console.log("ELECT LOOP");
		// console.log("nodes live ", nodes.filter(n => n.isLive()).length);
		const c = check();
		// console.log({c});
		if (c) {
			let live_nodes = nodes.filter(n => n.isLive());
			let node = live_nodes[Random(0, live_nodes.length)];
			node.makeCH(CR);
			clusters.push(new Cluster([node]));
		} else {
			for (var node of nodes) {
				let t = T(node);
				// console.log({t});

				if (node.isLive() && (Math.random() < t)) {

					node.makeCH(CR);
					clusters.push(new Cluster([node]));

				}

			}
		}
	}

	for (var node of nodes) {
		if (node.isCH(CR) || !node.isLive())
			continue;
		var minCluster = clusters[0];
		var minDistance = node.pos.distance(minCluster.getCH().pos);
		for (var cluster of clusters) {
			if (node.pos.distance(cluster.getCH().pos) < minDistance) {
				minDistance = node.pos.distance(cluster.getCH().pos);
				minCluster = cluster;
			}
		}
		// mincluster is closest to node
		minCluster.addNode(node);
	}
}
function Random(min, max) {
	return Math.floor(min + Math.random() * (max - min));
}
function InitializeRandom() {
	nodes = [];
	for (var i = 0; i < NoNodes; i++) {
		var x = Random(0, width);
		var y = Random(0, height);

		let rep = false;
		for (var node of nodes) {
			if (node.pos.distance(new Pos(x, y)) < 5 || BS.pos.distance(new Pos(x, y)) < 10) {
				i--;
				rep = true;
				break;
			}
		}
		if (rep)
			continue;
		nodes.push(new Node(new Pos(x, y)));
		chart.addByCoord(x, y, "m");
	}
	chart.update();
}
function getTcf() {
	return (2 * nodes.length * (parameters.ps * 8)) / parameters.rate;
}
function getFrames() {
	return Math.floor((parameters.cri - getTcf()) / parameters.ri);
}

function redrawNodes() {
	chart.clearNodes();
	for (let node of nodes) {
		if (node.isLive())
			if (node.isCH(CR))
				chart.addByCoord(node.pos.x, node.pos.y, "ch");
			else
				chart.addByCoord(node.pos.x, node.pos.y, "m");
		else
			chart.addByCoord(node.pos.x, node.pos.y, "d");
	}

}
function drawConnections() {
	if (mouseOver)
		return;
	for (var cluster of clusters) {
		for (var i = 1; i < cluster.nodes.length; i++) {
			var node = cluster.nodes[i];
			drawLine(cluster.getCH().pos, node.pos, 1, "0,0,139");
		}
	}
}
function sleep(ms) {
	return new Promise(resolve => timeoutes.push(setTimeout(resolve, ms)));
}
// var count = 1;
function startFrame() {
	document.getElementById('currentFrame').innerText = "Current Frame : " + CRF;
	CRF++;
	let e_arr = [];
	for (let node of nodes) {
		e_arr.push(node.energy);
	}
	rdata.entries.push({ t: Date.now(), e: e_arr });
	for (var i in clusters) {
		var cluster = clusters[i];
		var timepassed = 0;
		var ch = cluster.getCH();
		for (let j = 1; j < cluster.nodes.length; j++) {
			timepassed += (parameters.ri / cluster.nodes.length);
			var node = cluster.nodes[j];
			// console.log({ ch });
			timeouts.push(setTimeout(function (node, ch) {
				if (node.isLive()) {
					node.energy -= parameters.dpe * (parameters.ps * 8 + parameters.tefp * Math.pow(node.pos.distance(ch.pos), 2));
					drawLine(node.pos, ch.pos, 2, "199,21,133");
				}
			}, timepassed * 1000 / parameters.simRate, node, ch));

		}
		timepassed += (parameters.ri / cluster.nodes.length);
		timeouts.push(setTimeout(function (ch) {
			if (!ch.isLive())
				return;
			let d = ch.pos.distance(BS.pos);
			let n = cluster.nodes.length;
			let b = parameters.ps * 8;
			ch.energy -= n * b * parameters.dpe + n * b * parameters.ecda + b * parameters.tempp * Math.pow(d, 4);
			drawLine(ch.pos, BS.pos, 2, "199,21,133");
			setTimeout(function () {
				redrawNodes();
				chart.update();
				drawConnections();
			}, 250);
		}, timepassed * 1000 / parameters.simRate, ch));

	}
}

var timeouts = [];
function startRound() {
	let timepassed = 0;
	// setup phase
	timepassed = getTcf();
	if (isAllDead()) {
		stopSimulation();
	}

	timeouts.push(setTimeout(function () {
		elect();
		redrawNodes();
		chart.update();
		drawConnections();
	}, timepassed * 1000 / parameters.simRate));

	// console.log(clusters.length);
	CRF = 1;

	document.getElementById('currentRoundLabel').innerText = "Current Round : " + CR;
	let frames = getFrames();
	for (var i = 0; i < frames; i++) {
		timepassed += parameters.ri;
		timeouts.push(setTimeout(startFrame, timepassed * 1000 / parameters.simRate));
	}
	timepassed += parameters.ri;
	timeouts.push(setTimeout(function () {
		CR++
	}, timepassed * 1000 / parameters.simRate));
}

var roundInterval;

function isAllDead() {
	for (let n of nodes) {
		if (n.isLive()) {
			return false;
		}
	}
	return true;
}

function startSimulation() {
	if (simulation_running)
		return;
	simulation_running = true;
	// console.log({frames: getFrames()});
	document.getElementById('currentRoundLabel').style.visibility = 'visible';
	document.getElementById('currentFrame').style.visibility = 'visible';
	if (nodes.length < minnodes) {
		chart.clearNodes();
		InitializeRandom();
	}
	rdata = {};
	rdata.entries = [];
	rdata.startTime = Date.now();
	// let timeinterval = getTcf() + (getFrames().length+1)*parameters.ri;
	CR = 1;
	startRound();
	roundInterval = setInterval(startRound, parameters.cri * 1000 / parameters.simRate);

}

function stopSimulation() {
	if (!simulation_running)
		return;
	simulation_running = false;
	document.getElementById('currentRoundLabel').style.visibility = 'hidden';
	document.getElementById('currentFrame').style.visibility = 'hidden';

	for (var t of timeouts) {
		clearTimeout(t);
	}
	timeouts = [];
	clearInterval(roundInterval);
	rdata.endTime = Date.now();
	// console.log("FINISHED")
}
