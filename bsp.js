var geom = require('./geom');
var randomInt = require('./utils').randomInt;

var Rectangle = geom.Rectangle;
var Vector2 = geom.Vector2;
var Path = geom.Path;

var BSPTree = function(leaf) {
  this.leaf = leaf;
  this.leftChild;
  this.rightChild;
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
  return [].concat(this.leftChild.getLeaves(), this.rightChild.getLeaves());
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

BSPTree.prototype._nearest = function(leftChild, rightChild, point) {

  if (rightChild === undefined) {
    return false;
  }

  if (leftChild === undefined) {
    return false;
  }

  if (leftChild.leaf.containsPoint(point)) {
    return leftChild.leaf;
  }

  if (rightChild.leaf.containsPoint(point)) {
    return rightChild.leaf;
  }

  return this._nearest(leftChild.leftChild, rightChild.rightChild, point);
}

BSPTree.prototype.nearestLeaf = function(point) {
  for (var i = this.getLevels(); i > 0; i-- ) {
    var level = this.getLevel(i);
    for (var j = 0; j < level.length; j++) {
      var node = level[j];
      if (node.rightChild.leaf.containsPoint(point)) return node.rightChild.leaf;
      if (node.leftChild.leaf.containsPoint(point)) return node.leftChild.leaf;
    }
  }
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
    rect1 = new Rectangle(
      rect.x, rect.y,
      randomInt(1, rect.w), rect.h
    );

    rect2 = new Rectangle(
      rect.x + rect1.w, rect.y,
      rect.w - rect1.w, rect.h
    );
    if (rect1.v_aspect < BSPTree.MIN_ASPECT || rect2.v_aspect < BSPTree.MIN_ASPECT) {
      return BSPTree.splitRandom(rect);
    }
  } else {
    rect1 = new Rectangle(
      rect.x, rect.y,
      rect.w, randomInt(1, rect.h)
    );

    rect2 = new Rectangle(
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
