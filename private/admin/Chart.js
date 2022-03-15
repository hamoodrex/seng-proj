var width = 100;
var height = 100;
var mouseOver = false;;
let cvs = document.getElementById("cvs");
cvs.addEventListener("mouseleave", function (event) {
	mouseOver = false;
	drawConnections();
}, false);
cvs.addEventListener("mouseover", function (event) {
	mouseOver = true;
	chart.update();
}, false);
var config = {
	//type: "bubble",
	data: {
		datasets: [{
			type: "bubble",
			label: "Member nodes",
			data: [
			],
			backgroundColor: "rgb(30,150,75)"
		}, {
			type: "bubble",
			label: "Cluster heads",
			data: [
			],
			backgroundColor: "rgb(234,53,44)"
		}, {
			type: "bubble",
			label: "Dead nodes",
			data: [
			],
			backgroundColor: "rgb(128,128,128)"
		}, {
			type: "bubble",
			label: "Base station",
			data: [
			],
			backgroundColor: "rgb(255,255,255)"
		},
		]
	},
	options: {
		responsive: true,
		plugins: {
			tooltip: {
				callbacks: {
					title: (items, data) => {
						if (items[0].label === 'Base station') {
							return items[0].label;
						}
						if (items && items.length > 0 && items[0].dataset) {
							const cnx = items[0].dataset.data[items[0].datasetIndex].x;
							const cny = items[0].dataset.data[items[0].datasetIndex].y;
							const n = nodes.filter(n => n.pos.x === cnx && n.pos.y === cny)[0];
							return "E " + n.energy;
						}
					}
				}
			}
		},
		hover: {
			animationDuration: 0, // duration of animations when hovering an item
		},
		animation: {
			duration: 0,
		},
		scales: {
			x: {
				min: 0,
				max: width
			},
			y: {
				min: 0,
				max: height
			}
		},
		onClick: function (evt) {
			if (simulation_running)
				return;
			const canvasPosition = Chart.helpers.getRelativePosition(evt, chart);

			let x = chart.scales.x.getValueForPixel(canvasPosition.x);
			let y = chart.scales.y.getValueForPixel(canvasPosition.y);
			x = Math.round(x);
			y = Math.round(y);
			if (x > width || y > height)
				return;
			if (BS !== undefined && BS.pos.distance(new Pos(x, y)) < 10)
				return;
			for (let i in nodes) {
				let node = nodes[i];
				if (node.pos.distance(new Pos(x, y)) == 0) {
					nodes.splice(i, 1);
					chart.removeByCoord(x, y);
					chart.update();
					return;
				}
				if (node.pos.distance(new Pos(x, y)) < 5)
					return;
			}
			nodes.push(new Node(new Pos(x, y)));
			chart.addByCoord(x, y, "m");
			chart.update();
		}
	}

};

var chart = new Chart("cvs", config);

// 4 types ("m", "ch", "d", "bs")
const membersize = 5, chsize = 10, deadsize = 5, bssize = 15;
chart.addByCoord = function (x, y, type) {
	if (type.toLowerCase() == "m") {
		config.data.datasets[0].data.push({
			x: x,
			y: y,
			r: membersize
		});
	} else if (type.toLowerCase() == "ch") {
		config.data.datasets[1].data.push({
			x: x,
			y: y,
			r: chsize
		});
	} else if (type.toLowerCase() == "d") {
		config.data.datasets[2].data.push({
			x: x,
			y: y,
			r: deadsize
		});
	} else if (type.toLowerCase() == "bs") {
		config.data.datasets[3].data.push({
			x: x,
			y: y,
			r: bssize
		});
	}
}

chart.removeByCoord = function (x, y) {
	for (var dataset of config.data.datasets) {
		for (var i in dataset.data) {
			var pos = dataset.data[i];
			if (pos.x == x && pos.y == y) {
				dataset.data.splice(i, 1);
			}
		}
	}
}

chart.clearNodes = function () {
	for (var i = 0; i < 3; i++) {
		config.data.datasets[i].data = [];
	}
}

function drawLine(pos1, pos2, width, color) { // color="R,G,B"
	var point1 = {
		x: chart.scales.x.getPixelForValue(pos1.x),
		y: chart.scales.y.getPixelForValue(pos1.y)
	};
	var point2 = {
		x: chart.scales.x.getPixelForValue(pos2.x),
		y: chart.scales.y.getPixelForValue(pos2.y)
	};
	chart.ctx.strokeStyle = 'rgb(' + color + ')';
	chart.ctx.beginPath();
	chart.ctx.moveTo(point1.x, point1.y);
	chart.ctx.lineTo(point2.x, point2.y);
	chart.ctx.lineWidth = width;
	chart.ctx.stroke();
}
