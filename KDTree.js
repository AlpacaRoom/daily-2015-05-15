function KDTree(points, depth) {
	"use strict";
	var median = Math.floor(points.length / 2);

	if (!points || points.length === 0) {
		return;
	}

	if (depth === undefined) {
		depth = 0;
	}

	this.depth = depth;
	this.k = points[0].length;
	this.axis = this.depth % this.k;
	this.visited = false;

	// Insert the median point into this node
	// Left child gets nodes <= median, right child gets nodes > median
	this.quickSelect(points, median, this.axis);
	this.point = points[median];
	if (points.length > 1) {
		this.left = new KDTree(points.slice(0, median), this.depth + 1);	
	} else {
		this.left === null;
	}
	if (median <= points.length - 2) {
		this.right = new KDTree(points.slice(median + 1), this.depth + 1);
	} else {
		this.right === null;
	}
}

/**
 * Marks a node as visited instead of removing it because we don't need real
 * pruning right now.
 */
KDTree.prototype.remove = function() {
	this.visited = true;
};

/**
 * Uses Quick Select to ensure that the kth element of arr is
 * in the correct position.
 */
KDTree.prototype.quickSelect = function(arr, k, axis) {
	"use strict";
	if (!arr || arr.length < k || axis >= arr[0].length) {
		throw new Error("Invalid list to sort.");
	}

	var start = 0,
		end = arr.length - 1,
		left = start,
		right = end,
		pivot,
		temp;
	
	// Iterate until our start and end points meet
	while (start < end) {
		left = start;
		right = end;
		pivot = arr[Math.ceil(Math.random() * (right - left)) + left][axis];

		// Swap elements as long as the left elements are greater than the pivot
		while (left < right) {
			if (arr[left][axis] > pivot) {
				temp = arr[left];
				arr[left] = arr[right];
				arr[right] = temp;
				right--;
			} else {
				left++;
			}
		}
		
		// We went too far, need to back up
		if (arr[left][axis] >= pivot) {
			left--;
		}
		
		// If we haven't ordered enough elements yet, move our bounds
		if (k <= left) {
			end = left;
		} else {
			start = left + 1;
		}
	}
};

/**
 * Finds the nearest point to the given point.
 */
KDTree.prototype.nearest = function(node, best) {
	"use strict";
	var axis = this.depth % this.k,
		distance,
		distanceToPlane,
		child;

	if (best === undefined) {
		best = {
			distance: Infinity,
			point: null,
			node: null
		};
	}

	if (!this.visited) {
		distance = this.distance(node);
		if (distance < best.distance) {
			best.distance = distance;
			best.point = this.point;
			best.node = this;
		}
	}

	// If we've reached a leaf, just go back
	if (this.left === null && this.right === null) {
		return best;
	}

	// Otherwise, go on down the tree
	distanceToPlane = Math.pow(node[this.axis] - this.point[this.axis], 2);
	child = node[this.axis] > this.point[this.axis] ? "right" : "left";
	// Check the correct-direction child first
	if (this[child]) {
		best = this[child].nearest(node, best);
	}

	// Then, if the radius crosses the plane, check the other one
	if (distanceToPlane <= best.distance) {
		child = child === "right" ? "left" : "right";
		if (this[child]) {
			best = this[child].nearest(node, best);
		}
	}

	return best;
};

/**
 * Provides the squared distance from this node's point to the provided point.
 */
KDTree.prototype.distance = function(node) {
	var distance = 0,
		i;

	for (i = 0; i < this.k; i++) {
		distance += Math.pow(this.point[i] - node[i], 2);
	}
	return distance; 
};

KDTree.prototype.print = function() {
	console.log(this.axis, this.point[this.axis], this.point, this.depth);
	if (this.left) {
		this.left.print();
	}
	if (this.right) {
		this.right.print();
	}
}

module.exports = KDTree;