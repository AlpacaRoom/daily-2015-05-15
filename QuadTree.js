var MAX_ITEMS = 4,
    MAX_DEPTH = 6,
    Queue = require('./PriorityQueue.js');

/**
 * Takes the x, y coordinates of the top-left of the rectangle along with width and height.
 * Sets children and objects to empty arrays.
 */
function QuadTree(x, y, width, height, level) {
    if (x === undefined || y === undefined || width ===  undefined || height === undefined) {
        throw new Error("Bounds");
    }
    this.level = level === undefined ? 0 : level;
	this.children = [];
	//this.bounds = new Bounds(x, y, width, height);
    this.bounds = {
        x: x,
        y: y,
        width: width,
        height: height,
        xMax: x + width,
        yMax: y + height
    };
	this.objects = [];
}

/**
 * Getters and setters for our config options
 */
QuadTree.prototype.getMaxItems = function() {
    return MAX_ITEMS;
};

QuadTree.prototype.setMaxItems = function(max) {
    if (parseInt(max)) {
        MAX_ITEMS = max;
    }
};

QuadTree.prototype.getMaxDepth = function() {
    return MAX_DEPTH;
};

QuadTree.prototype.setMaxDepth = function(max) {
    if (parseInt(max)) {
        MAX_DEPTH = max;
    }
};

/**
 * Empties the tree.
 */
QuadTree.prototype.clear = function() {
	var i;

	for (i = 0; i < this.children.length; i++) {
		this.children[i].clear();
		this.children[i] = null;
	}
    
    this.children = [];
    this.objects = [];
};

/**
 * Inserts a point into the tree.
 * Recurses until it finds the appropriate leaf.
 */
QuadTree.prototype.insert = function(node) {
	var top = node.y < this.bounds.y + (this.bounds.height / 2), 
		left = node.x < this.bounds.x + (this.bounds.width / 2);

    // Throw an error if the point isn't inside the bounds
    if (!this.contains(node)) {
        console.log(this.bounds, node);
        throw new Error("Bounds");
    }

    // If there are no children, we're at a leaf node, so do the insert		
	if (this.children.length === 0) {
		if (this.objects.length === MAX_ITEMS && this.level !== MAX_DEPTH) {
			this.split();
			return this.insert(node);
		} else {
			this.objects.push(node);
			return this;
		}
	}

    // Otherwise, call insert() on the appropriate child node
	if (top && !left) {
		return this.children[0].insert(node);
	}
	
	if (top && left) {
		return this.children[1].insert(node);
	}
	
	if (!top && left) {
		return this.children[2].insert(node);
	}
	
	if (!top && !left) {
		return this.children[3].insert(node);
	}
};

/**
 * Calls find() to locate the node, then removes it from the tree.
 * 
 * We don't coalesce the tree, although that might speed up searches once
 * the tree becomes sparse.
 */
QuadTree.prototype.remove = function(node) {
	var loc = this.find(node);

    if (!loc || !loc.node || loc.index === undefined) {
        throw new Error ("Not Found");
    }
    
    loc.node.objects.splice(loc.index, 1);
    return loc.node;
};

/**
 * Finds the nearest neighbor of the given node.
 * Returns an object contianing the node and the distance.
 */
QuadTree.prototype.nearest = function(node, best, queue) {
    var i,
        distance,
        current;

    if (best === undefined) {
        best = {
            distance: Infinity,
            node: null,
            radius: this.bounds
        };
    }
    
    if (queue === undefined) {
        queue = new Queue();
    }
    
    // If we're a leaf, look for a closer node in the objects[] array
    if (this.objects.length > 0) {
        for (i = 0; i < this.objects.length; i++) {
            distance = this.distance(this.objects[i], node);
            if (distance < best.distance) {
                best.distance = distance;
                best.node = this.objects[i];
            }
        }
        return best;
    }
    
    // Otherwise, push the children into the queue, with the priority set to the minimum distance from the point
    for (i = 0; i < this.children.length; i++) {
        queue.enqueue(this.children[i], this.children[i].minDist(node));    
    }

    // Grab the next-nearest rectangle from the queue and, if it's closer than the current best, process it    
    while (queue.length > 0) {
        current = queue.dequeue();
        if (current.priority > best.distance) {
            return best;
        }
        best = current.nearest(node, best, queue);
    }

    return best;
};

/**
 * Traverses the tree until we find the leaf that should contain the node,
 * then iterates over the nodes until we find it.
 * 
 * Returns false if it's not found.
 * 
 * Returns an object containing the parent node and the index of the object.
 */
QuadTree.prototype.find = function(node) {
	var top = node.y < (this.bounds.y + (this.bounds.height / 2)),
		left = node.x < (this.bounds.x + (this.bounds.width / 2)),
		i;
	
	if (!this.contains(node)) {
        throw new Error("Bounds");
    }
    
    // If we're at a leaf, look for the node in the objects array
    if (this.children.length === 0) {
        for (i = 0; i < this.objects.length; i++) {
            if (this.objects[i].x === node.x && this.objects[i].y === node.y) {
                return { node: this, index: i };
            }
        }
        return false;
    }

    // Otherwise, call find() on the appropriate child node
    if (top && !left) {
        return this.children[0].find(node);
    }
    
    if (top && left) {
        return this.children[1].find(node);
    }
    
    if (!top && left) {
        return this.children[2].find(node);
    }
    
    if (!top && !left) {
        return this.children[3].find(node);
    }
};

/**
 * Returns all the rectangles in the tree (probably for drawing it).
 */
QuadTree.prototype.getRectangles = function(rects) {
    var i;

    if (!rects) {
        rects = [];
    }

    rects.push(this.bounds);

    for (i = 0; i < this.children.length; i++) {
        rects = this.children[i].getRectangles(rects);
    }

    return rects;
};

/**
 * Returns all the objects in the tree (probably for drawing it).
 */
QuadTree.prototype.getObjects = function(objs) {
    var i;
    
    if (!objs) {
        objs = [];
    }
    
    if (this.objects.length) {
        for (i = 0; i < this.objects.length; i++) {
            objs.push(this.objects[i]);
        }
        return objs;
    } else {
        for (i = 0; i < this.children.length; i++) {
            objs = this.children[i].getObjects(objs);
        }
        return objs;
    }
};

QuadTree.prototype.distance = function(a, b) {
    return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
};

QuadTree.prototype.contains = function(node) {
    return node.x >= this.bounds.x && node.x < this.bounds.xMax && node.y >= this.bounds.y && node.y < this.bounds.yMax;
};

QuadTree.prototype.minDist = function(node) {
    "use strict";
    var topLeft = { x: this.bounds.x, y: this.bounds.y },
        topRight = { x: this.bounds.xMax, y: this.bounds.y },
        bottomRight = { x: this.bounds.xMax, y: this.bounds.yMax },
        bottomLeft = { x: this.bounds.x, y: this.bounds.yMax };

    if (this.contains(node)) {
        return 0;
    }

    // If the point isn't in the bounds, we check to see if it's nearer in one dimension and return the distance in the other one
    if (node.x >= this.bounds.x && node.x < this.bounds.xMax) {
        return Math.min(Math.abs(node.y - this.bounds.y), Math.abs(node.y - this.bounds.yMax));
    }
    
    if (node.y >= this.bounds.y && node.y < this.bounds.yMax) {
        return Math.min(Math.abs(node.x - this.bounds.x), Math.abs(node.x - this.bounds.xMax));
    }
    
    return Math.min(Math.min(this.distance(node, topLeft), this.distance(node, bottomRight)), Math.min(this.distance(node, bottomLeft), this.distance(node, topRight)));
};

QuadTree.prototype.split = function() {
    var bounds = [],
        width = this.bounds.width / 2 ,
        height = this.bounds.height / 2,
        i;

	// Top-right
	//bounds[0] = new Bounds(this.x + width, this.y, width, height);
    this.children[0] = new QuadTree(this.bounds.x + width, this.bounds.y, width, height, this.level + 1);
	// Top-left
	//bounds[1] = new Bounds(this.x, this.y, width, height);
    this.children[1] = new QuadTree(this.bounds.x, this.bounds.y, width, height, this.level + 1);
	// Bottom-left
	//bounds[2] = new Bounds(this.x, this.y + height, width, height);
    this.children[2] = new QuadTree(this.bounds.x, this.bounds.y + height, width, height, this.level + 1);
	// Bottom-right
	//bounds[3] = new Bounds(this.x + width, this.y + height, width, height);
    this.children[3] = new QuadTree(this.bounds.x + width, this.bounds.y + height, width, height, this.level + 1);
    
    for (i = 0; i < this.objects.length; i++) {
        this.insert(this.objects[i]);
    }
    
    this.objects = [];
};

module.exports = QuadTree;