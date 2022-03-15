$("#logout").click(function () {
	window.location.href = window.location.origin + "/logout";
});

if (localStorage.saves === undefined)
	localStorage.setItem("saves", "[]");

$(".dropdown-item").click(async function (evt) {
	try {
		if (evt.target.dataset.label) {
			if (document.getElementById(`input${evt.target.dataset.label}`))
				$(`#input${evt.target.dataset.label}`).remove();
			$(`<form id='inputform'><img src='Guide.PNG'><br>${evt.target.innerText}: <input min='0.001' id='input${evt.target.dataset.label}' type='number' value='${parameters[evt.target.dataset.label]}'></form>`).dialog({
				modal: true,
				resizeable: false,
				width: 650,
				title: evt.target.innerText,
				buttons: {
					'OK': function () {
						var input = $(`#input${evt.target.dataset.label}`).val();
						parameters[evt.target.dataset.label] = parseFloat(input);
						$(this).dialog('close');
					},
					'Cancel': function () {
						$(this).dialog('close');
					}
				}
			});

		} else if (id = parseInt(evt.target.id)) {
			if (id == 1)
				window.location.reload();

			// save simulation
			if (id == 2) {
				var obj = {
					date: (new Date()).toISOString(),
					parameters: parameters,
					nodes: nodes,
				};

				addSave(obj);
			}
			if (id == 3) {
				if (document.getElementById("saveform"))
					$("#saveform").remove();
				let html = "<form id='saveform'>";
				let saves = await getSaves();
				if (saves.length < 1) {
					$("<form></form>").dialog({
						modal: true,
						title: "There are no simulations to be loaded!",
						resizeable: false,
						width: 400,
						buttons: {
							"OK": function () {
								$(this).dialog('close');
							}
						}
					});
					return;
				}
				let style = `background-color: orange; color: white; width: 100%;`;
				for (var i in saves) {
					let save = saves[i];
					html += `<div style="${style}">ID: ${i}, ${save.date}</div>`;
				}
				html += `<input onkeydown="return false" id="savetextbox" style="width: 100%" type="number" value="0" min="0" max="${saves.length - 1}"></form>`;
				$(html).dialog({
					modal: true,
					title: "Simulations",
					resizeable: false,
					width: 300,
					buttons: {
						'Load': function () {
							var save = saves[parseInt($(`#savetextbox`).val())];
							parameters = save.parameters;
							nodes = save.nodes.map(n => Node.fromObject(n));
							chart.clearNodes();
							redrawNodes();
							chart.update();
							drawConnections();
							$(this).dialog('close');
						},
						'Delete': function () {
							var date = saves[parseInt($(`#savetextbox`).val())].date;
							deleteSave(date);
							$(this).dialog('close');
						}
					}
				});
			}
			if (id == 14) {
				if (!("entries" in rdata) || rdata.entries.length < 5 || simulation_running) {
					$("<form></form>").dialog({
						modal: true,
						title: simulation_running ? "The simulation is running!" : "Not enough data to display!",
						resizeable: false,
						width: 400,
						buttons: {
							"OK": function () {
								$(this).dialog('close');
							}
						}
					});
					return;
				}
				if (document.getElementById("result-cvs"))
					$("#result-cvs").remove();
				$(`<div><canvas id="result-cvs" height="400" width="800"></canvas></div>`).dialog({
					modal: true,
					title: "Simulations",
					resizeable: false,
					width: 800,
					buttons: {
						'Close': function () {
							$(this).dialog('close');
						},
					}
				});
				displayResults();
			}
			if (id == 15)
				startSimulation();
			if (id == 16)
				stopSimulation();
			if (id == 17) {
				for (let node of nodes) {
					node.energy = parameters.ine;
				}
				redrawNodes();
				chart.update();
				drawConnections();
			}

		}

	} catch (err) {
		console.log(err);
	}

});

async function addSave(obj) {
	// let temp = JSON.parse(localStorage.getItem("saves"));
	let temp = await getSaves();

	temp.push(obj);
	fetch('/set_data', { method: 'POST', body: JSON.stringify(temp), headers: { 'Content-Type': 'application/json' } }).then(res => res.json())
		.then(res => {
			console.log(res);
		}).catch(err => console.log(err));
	// localStorage.setItem("saves", JSON.stringify(temp));

}
async function deleteSave(date) {
	let saves = await getSaves();
	for (let i in saves) {
		let save = saves[i];
		if (save.date == date) {
			saves.splice(i, 1);
			break;
		}
	}
	fetch('/set_data', { method: 'POST', body: JSON.stringify(saves), headers: { 'Content-Type': 'application/json' } }).then(res => res.json())
		.then(res => {
			console.log(res);
		}).catch(err => console.log(err));
	// localStorage.setItem("saves", JSON.stringify(saves));

}
async function getSaves() {
	let saves = null;
	await fetch('/get_data').then(res => res.json()).then(res => {
		console.log(res);
		saves = res;
	}).catch(err => { console.log(err) })
	// return JSON.parse(localStorage.getItem("saves"));
	return saves;
}

