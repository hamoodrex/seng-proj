var results;
function displayResults() {
	let minenergy = nodes[0].energy;
	for (let node of nodes){
		if (node.energy < minenergy){
			minenergy = node.energy;
		}
	}
	// console.log(minenergy)
	var config = {
		type: "line",
		data: {
			datasets: [
			]
		},
		options: {
			responsive: true,
			plugins: {
				legend: false
			},
			scales: {
				xAxis: {
					min: 0,
					max: rdata.entries.length,
					stepSize: 1,
					type: "linear"
				},
				y: {
					min: minenergy,
					max: parameters.ine,
					stepSize: (parameters.ine - minenergy)/10
				}
			},
		}

	};
	results = new Chart("result-cvs", config);
	let firstentry = rdata.entries[0];
	var nodec = 1;
	for (let e of firstentry.e) {
		results.config.data.datasets.push({
			label: "Node " + nodec,
			data: [],
			fill: false,
			borderColor: "rgb(255,0,0)",
			tension: 0.1
		});
		nodec++;
	}
	for (let j in rdata.entries) {
		let entry = rdata.entries[j];
		for (let i in entry.e) {
			results.config.data.datasets[i].data.push({x: j, y: entry.e[i]});
			// console.log("entery push",entry.e[i])
		}
	}
	results.update();
}
