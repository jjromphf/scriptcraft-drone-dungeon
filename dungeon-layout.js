var randomInt = require('./utils').randomInt;
var geom = require('./geom');
var BSPTree = require('./bsp').BSPTree;

var Rectangle = geom.Rectangle;
var Vector2 = geom.Vector2;

// rooms are 1 / 3 the size of containing rectangle

var Room = function(rect) {
  this.x = rect.x + randomInt(0, Math.floor(rect.w/3));
  this.y = rect.y + randomInt(0, Math.floor(rect.h/3));
  this.w = rect.w - (this.x - rect.x);
  this.h = rect.h - (this.y - rect.y);
  this.w -= randomInt(0, this.w/3);
  this.h -= randomInt(0, this.h/3);
  this.centroid = new Vector2(
    this.x + (this.w / 2),
    this.y + (this.h / 2)
  );
  return this;
}

var DungeonLayout = function(width, height, nIterations) {
  this.width = width;
  this.height = height;
  this.area = this.width * this.height;
  this.nIterations = nIterations;
  var map = new Rectangle(0, 0, width, height);
  this.tree = BSPTree.splitRect(map, this.nIterations);
  this.rooms = [];
  this._makeRooms();
}

DungeonLayout.prototype._makeRooms = function() {
  this.rooms = this.tree.getLeaves().map(function(leaf) {
    return new Room(leaf);
  });
}

DungeonLayout.prototype.regenerate = function(width, height, nIterations) {
  this.width = width ? width : this.width;
  this.height = height ? height : this.height;
  this.nIterations = nIterations ? nIterations : this.nIterations;
  var map = new Rectangle(0, 0, width, height);
  this.tree = BSPTree.splitRect(map, this.nIterations);
  this._makeRooms();
}

module.exports = DungeonLayout;
