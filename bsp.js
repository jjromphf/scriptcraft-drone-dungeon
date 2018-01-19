var geom = require('./geom');
var randomInt = require('./utils').randomInt;

var Rectangle = geom.Rectangle;
var Vector2 = geom.Vector2;

var BSPTree = function(leaf) {
  this.leaf = leaf;
  this.leftChild;
  this.rightChild;
}

// class constants
BSPTree.MIN_ASPECT = 0.45;
BSPTree.SPLIT_H = 0;
BSPTree.SPLIT_V = 1;

BSPTree.prototype.getLeaves = function() {
  if (this.leftChild === undefined && this.rightChild === undefined) {
    return this.leaf;
  }
  return [].concat(this.leftChild.getLeaves(), this.rightChild.getLeaves());
}

BSPTree.prototype.getNodes = function() {
  if (this.leftChild && this.rightChild) {
    return this;
  } else {
    return [].concat(this.leftChild.getNodes(), this.rightChild.getNodes());
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
  } else {
    rect1 = new Rectangle(
      rect.x, rect.y,
      rect.w, randomInt(1, rect.h)
    );

    rect2 = new Rectangle(
      rect.x, rect.y + rect1.h,
      rect.w, rect.h - rect1.h
    );
  }

  if (rect1.aspect < BSPTree.MIN_ASPECT || rect2.aspect < BSPTree.MIN_ASPECT) {
    return BSPTree.splitRandom(rect);
  }
  return [rect1, rect2];
}

module.exports = {
  BSPTree: BSPTree,
}
