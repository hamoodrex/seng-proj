$("#logout").click(function () {
	window.location.href = window.location.origin + "/logout";
});

$(".dropdown-item").click(function (evt) {
	try {
		if (id = parseInt(evt.target.id)) {
			if (id == 1)
				window.location.reload();
			
			if (id == 14){
				if (!("entries" in rdata) || rdata.entries.length < 5 || simulation_running){
					$("<form></form>").dialog({
						modal: true,
						title: simulation_running ? "The simulation is running!":"Not enough data to display!",
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
