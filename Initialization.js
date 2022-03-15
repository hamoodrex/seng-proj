const { BaseStation, Pos } = require("../../../Downloads/Nodes");

// JavaScript source code
var width, height, p, CR, IE;
var NoNodes = 100;
var nodes = [];
var BS; // Base station

// max is not included
function Random(min, max) {
    return Math.floor(min + Math.random() * (max - min));
}

function InitializeNodes() {
    for (var i = 0; i < NoNodes; i++) {
        var x = Random(0, width);
        var y = Random(0, height);

        for (var node of nodes) {
            if ((node.pos.x == x && node.pos.y == y) || (x == BS.pos.x && y == BS.pos.y)) {
                i--;
                continue;
            }
        }
        nodes.push(new Node(IE, new Pos(x, y), "#000000"));
    }
    CR = 1;
}

var clusters = [];
for (var node of nodes) {
    if (Math.random() < 0.1) {
        if (node.hasBeenCH(1 / 0.1, CR)) {
            continue;
        }
        node.makeCH(CR);
        clusters.push(new Cluster([node], "#0000000"));
    }
}



// E_CH and E_CM are energy consumption arrays of cluster head and cluster members
// variables on line 58 are taken from the table in project explanation document
function StartRound() {
    var bits, Eelec, Eda, Efs, Emp;
    var E_CH = [];
    var E_CM = [];
    BS = new BaseStation(new Pos(50, 175), "#FF0000");

    var frames, Tcf, Tcrf, Trep, rate; // no of bits and rate in bits/sec to be taken from user
    Tcf = (2 * NoNodes * bits) / rate;
    frames = Math.floor((Tcrf - Tcf) / Trep);

    // we multiply the number of frames in a round with the energy consumption of the cluster heads and members
    // we go over all the clusters to calculate energy consumption of each CH and
    // another loop for all the CMs in each cluster
    for (var cluster of clusters) {
        E_CH.push(IE - (frames * (NoNodes * bits * (Eelec + Eda) + bits * (Eelec + Emp * cluster.pos.distance(BS.pos)))));
        for (var node of nodes) {
            E_CM.push(IE - (frames * (bits * (Eelec + Efs * nodes[i].pos.distance(cluster.getCH.pos)))));
        }
    }

    

    CR++;
}