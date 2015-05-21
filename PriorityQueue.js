/**
 * PriorityQueue module.
 * @module PriorityQueue
 */

/**
 * Creates a new queue
 * @constructor
 * @classdesc Implements a simple priority queue
 */
function PriorityQueue() {
	this._queue = [null];
	this.length = 0;
}

/** Clears and resets the queue */
PriorityQueue.prototype.reset = function() {
    this._queue = [null];
    this.length = 0;
};

/**
 * Adds a new value to the queue with the given priority
 * @param {Object} value - The value to add. If a non-object value is submitted, it will be promoted to an object with its value in the .value property
 * @param {Number} priority - The priority of the item. Lower priorities will be returned first.
 */
PriorityQueue.prototype.enqueue = function(value, priority) {
	var val = typeof value === "object" ? value : { value: value };

	val.priority = priority;
	this._queue[++this.length] = val;
	this.bubble(this.length);
};

/**
 * Returns the property in the queue having the lowest priority
 * @returns {Object} - An object containing the item's value in the .value property and its priority in the .priority property.
 */
PriorityQueue.prototype.dequeue = function() {
	if (this.length < 1) {
		return false;
	}
	
	var value = this._queue[1];
	
	if (this.length >= 1) {
		this._queue[1] = this._queue[this.length--];
		this.sink(1);
	}
	return value;
};

/** @ignore */
PriorityQueue.prototype.bubble = function(index) {
	var value = this._queue[index],
		parentN = index >> 1,
		parent = this._queue[parentN];

	if (parent && value.priority < parent.priority) {
		this._queue[parentN] = value;
		this._queue[index] = parent;
		this.bubble(parentN);
	}
};

/** @ignore */
PriorityQueue.prototype.sink = function(index) {
	if (index > this.length && this.length < 1) {
		return;
	}
	
	var value = this._queue[index],
		leftChildIndex = index << 1,
		rightChildIndex = leftChildIndex + 1,
		swapIndex = index,
		swapData = value;
		
	if (leftChildIndex <= this.length) {
		var leftChild = this._queue[leftChildIndex];
		if (leftChild.priority < swapData.priority) {
			swapIndex = leftChildIndex;
			swapData = this._queue[leftChildIndex];
		}
	}
	
	if (rightChildIndex <= this.length) {
		var rightChild = this._queue[rightChildIndex];
		if (rightChild.priority < swapData.priority) {
			swapIndex = rightChildIndex;
			swapData = this._queue[rightChildIndex];
		}
	}
	
	if (swapIndex != index) {
		this._queue[index] = swapData;
		this._queue[swapIndex] = value;
		this.sink(swapIndex);
	}		
}

/**
 * Returns an array of the elements in the queue (in the order they are stored in the heap,
 * which is not priority order.)
 * @returns {Object[]} - The elements in the queue.
 */
PriorityQueue.prototype.array = function() {
	var result = []
	for (var i = 1; i <= this.length; i++) {
		result.push(this._queue[i]);
	}
	return result;
}

/**
 * Returns the index of the given item, or false if it isn't in the queue
 * @param {Object} value - The value to search for
 * @returns {Number} - The index of the element in the heap array
 */
PriorityQueue.prototype.find = function(value) {
	var index = -1,
		key,
	    val = typeof value === "object" ? value : { value: value };

	for (var i = 1; i <= this.length; i++) {
		var match = true;
		for (key in val) {
			if (this._queue[i][key] != val[key]) {
				match = false;
				break;
			}
		}
		if (match) {
			index = i;
			break;
		}
	}
	return index == -1 ? false : index;
}

/**
 * Changes the priority of a given item
 * @param {Object} value - The value to update
 * @param {Number} priority - The new priority to set
 */
PriorityQueue.prototype.update = function(value, priority) {
	var index = this.find(value);
	if (index) {
		this._queue[index].priority = priority;
		this.bubble(index);
		this.sink(index);
	}
}

module.exports = PriorityQueue;