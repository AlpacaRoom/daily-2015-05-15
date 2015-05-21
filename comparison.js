/*global process */
var QuadTree = require('./QuadTree.js'),
	KDTree = require('./KDTree.js'),
	benchmark = {
		QuadTree: {
			distance: 0,
			insertStart: null,
			insertEnd: null,
			nearestStart: null,
			nearestEnd: null
		},
		KDTree: {
			distance: 0,
			insertStart: null,
			insertEnd: null,
			nearestStart: null,
			nearestEnd: null			
		}
	},
	currentQuad = { x: 0.5, y: 0.5 },
	current = [0.5, 0.5],
	i,
	count, 
	points = [],
	quadPoints = [];

if (!parseInt(process.argv[2])) {
	var fs = require('fs'),
    	fileData = fs.readFileSync(process.argv[2], { encoding: 'utf8' }).split('\n');
    count = process.argv[3] || fileData[0];
    points = fileData.slice(1);
	points.pop();
	points = points.map(function(a) { return a.split(' '); });
	points = points.map(function(a) { return [parseFloat(a[0]), parseFloat(a[1])]; })
	quadPoints = points.map(function(p) { return { x: p[0], y: p[1] }; });
} else {
	count = process.argv[2];
	console.log("Generating " + count + " points...");
	for (i = 0; i < count; i++) {
			points[i] = [Math.random(), Math.random()];
		quadPoints[i] = { x: points[i][0], y: points[i][1] };
	}
}

// QuadTree insert test
console.log("Populating QuadTree...");
var q = new QuadTree(0, 0, 1, 1);
benchmark.QuadTree.insertStart = new Date();
for (i = 0; i < count; i++) {
	q.insert(quadPoints[i]);
}
benchmark.QuadTree.insertEnd = new Date();

// QuadTree nearest test
console.log("Searching QuadTree...");
benchmark.QuadTree.nearestStart = new Date();
for (i = 0; i < count; i++) {
    var result = q.nearest(currentQuad);
    benchmark.QuadTree.distance += result.distance;
    currentQuad = result.node;
    q.remove(result.node);
}
benchmark.QuadTree.nearestEnd = new Date();

// KDTree insert test
console.log("Populating k-d Tree...");
benchmark.KDTree.insertStart = new Date();
var k = new KDTree(points);
benchmark.KDTree.insertEnd = new Date();

// KDTree nearest test
current = [0.5, 0.5];
console.log("Searching k-d Tree...");
benchmark.KDTree.nearestStart = new Date();
for (i = 0; i < count; i++) {
	var result = k.nearest(current);
	benchmark.KDTree.distance += Math.sqrt(result.distance);
	current = result.point;
	result.node.remove();
}
benchmark.KDTree.nearestEnd = new Date();

console.log("Results:");
console.log("\tQuadTree:");
console.log("\tTime to populate: " + (benchmark.QuadTree.insertEnd - benchmark.QuadTree.insertStart) + "ms");
console.log("\tTime to search: " + (benchmark.QuadTree.nearestEnd - benchmark.QuadTree.nearestStart) + "ms");
console.log("\tTotal time: " + ((benchmark.QuadTree.insertEnd - benchmark.QuadTree.insertStart) + (benchmark.QuadTree.nearestEnd - benchmark.QuadTree.nearestStart)) + "ms");
console.log("\tDistance traveled: " + benchmark.QuadTree.distance);
console.log("\t__________");
console.log("\tKDTree:");
console.log("\tTime to populate: " + (benchmark.KDTree.insertEnd - benchmark.KDTree.insertStart) + "ms");
console.log("\tTime to search: " + (benchmark.KDTree.nearestEnd - benchmark.KDTree.nearestStart) + "ms");
console.log("\tTotal time: " + ((benchmark.KDTree.insertEnd - benchmark.KDTree.insertStart) + (benchmark.KDTree.nearestEnd - benchmark.KDTree.nearestStart)), "ms");
console.log("\tDistance traveled: " + benchmark.KDTree.distance);