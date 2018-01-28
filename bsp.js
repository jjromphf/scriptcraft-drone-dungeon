var geom = require('./geom');
var randomInt = require('./utils').randomInt;
var uuid = require('./utils').generateUUID;

var Rectangle = geom.Rectangle;
var Vector2 = geom.Vector2;
var Path = geom.Path;

var Container = function(x, y, w, h) {
  Rectangle.call(this, x, y, w, h);
  this.id = uuid();
}

Container.prototype = Object.create(Rectangle.prototype);

var BSPTree = function(leaf) {
  this.leaf = leaf;
  this.leftChild;
  this.rightChild;
  this.leaves = [];
  // need to cache this
  this.levels = null;
}

// class constants
BSPTree.MIN_ASPECT = 0.5;
BSPTree.SPLIT_H = 0;
BSPTree.SPLIT_V = 1;

BSPTree.prototype.getLeaves = function() {
  if (this.leftChild === undefined && this.rightChild === undefined) {
    return this.leaf;
  }
  return this.leaves.concat(this.leftChild.getLeaves(), this.rightChild.getLeaves());
}

// https://stackoverflow.com/questions/2597637/finding-height-in-binary-search-tree

BSPTree.prototype._height = function(node) {
  if (!node) {
    return -1;
  }
  var leftH = this._height(node.leftChild);
  var rightH = this._height(node.rightChild);
  if (leftH > rightH) {
    return leftH + 1;
  } else {
    return rightH + 1;
  }
}

BSPTree.prototype.getLevels = function() {
  if (!this.levels) {
    this.levels = this._height(this);
  }
  return this.levels;
}

BSPTree.prototype._nearest = function(node, point) {
  if (node.leftChild === undefined && node.rightChild === undefined) {
    return node.leaf;
  }

  if (node.leftChild.leaf.containsPoint(point)) {
    return this._nearest(node.leftChild, point);
  }

  if (node.rightChild.leaf.containsPoint(point)) {
    return this._nearest(node.rightChild, point);
  }
}

// also don't know if there's any way to do this
BSPTree.prototype.getLeaf = function(id) {
  return this.getLeaves().find(function(leaf) {
    return leaf.id === id;
  })
}

BSPTree.prototype.nearestLeaf = function(point) {
  return this._nearest(this, point);
}

BSPTree.prototype.getChildLevel = function(child, level, queue) {
  if (child !== undefined && queue !== undefined) {
    return child.getLevel(level, queue);
  }
}

BSPTree.prototype.getLevel = function(level, queue) {
  if (queue === undefined) {
    queue = [];
  }
    // the root
  if (level === 1) {
    queue.push(this);
  } else {
    this.getChildLevel(this.leftChild, level-1, queue);
    this.getChildLevel(this.rightChild, level-1, queue);
  }
  return queue;
}

// satic methods

BSPTree.splitRect = function(rect, iter) {
  var root = new BSPTree(rect);
  if (iter !== 0) {
    var split = BSPTree.splitRandom(rect);
    root.leftChild = BSPTree.splitRect(split[0], iter-1);
    root.rightChild = BSPTree.splitRect(split[1], iter-1);
  }
  return root;
}

BSPTree.splitRandom = function(rect) {
  if (randomInt(0, 1) === 0) {
    return BSPTree.doSplit(rect, BSPTree.SPLIT_V);
  }
  return BSPTree.doSplit(rect, BSPTree.SPLIT_H);
}

BSPTree.doSplit = function(rect, splitDirection) {
  var rect1, rect2;
  if (splitDirection === BSPTree.SPLIT_V) {
    rect1 = new Container(
      rect.x, rect.y,
      randomInt(1, rect.w), rect.h
    );

    rect2 = new Container(
      rect.x + rect1.w, rect.y,
      rect.w - rect1.w, rect.h
    );
    if (rect1.v_aspect < BSPTree.MIN_ASPECT || rect2.v_aspect < BSPTree.MIN_ASPECT) {
      return BSPTree.splitRandom(rect);
    }
  } else {
    rect1 = new Container(
      rect.x, rect.y,
      rect.w, randomInt(1, rect.h)
    );

    rect2 = new Container(
      rect.x, rect.y + rect1.h,
      rect.w, rect.h - rect1.h
    );
    if (rect1.h_aspect < BSPTree.MIN_ASPECT || rect2.h_aspect < BSPTree.MIN_ASPECT) {
      return BSPTree.splitRandom(rect);
    }
  }


  return [rect1, rect2];
}

module.exports = {
  BSPTree: BSPTree,
}
