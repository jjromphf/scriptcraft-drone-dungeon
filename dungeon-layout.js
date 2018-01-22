var randomInt = require('./utils').randomInt;
var geom = require('./geom');
var BSPTree = require('./bsp').BSPTree;

var Rectangle = geom.Rectangle;
var Vector2 = geom.Vector2;
var Path = geom.Path;

// rooms are 1 / 3 the size of containing rectangle

// inherits from Rectangle - defaults to 1 door, pass nDoors as option
var Room = function(x, y, w, h, containerId) {
  this.x = x + randomInt(0, Math.floor(w/3));
  this.y = y + randomInt(0, Math.floor(h/3));
  this.w = w - (this.x - x);
  this.h = h - (this.y - y);
  this.w -= randomInt(0, this.w/3);
  this.h -= randomInt(0, this.h/3);
  this.containerId = containerId;
  Rectangle.call(this, this.x, this.y, this.w, this.h);
  this.doors = [];
  this.makeDoors(1);
  return this;
}

Room.prototype = Object.create(Rectangle.prototype);

// could put in a minimum door distance if they fall too close together
Room.prototype.makeDoors = function(nDoors) {
  for (i = 0; i < nDoors; i++) {
    var side = Object.values(Rectangle.SIDES)[randomInt(0, 3)];
    var wall = this[side];
    if (wall.direction === Path.VERTICAL) {
      this.doors.push(new Vector2(
        wall.start.x,
        randomInt(wall.start.y, wall.end.y)
      ));
    } else {
      this.doors.push(new Vector2(
        randomInt(wall.start.x, wall.end.x),
        wall.start.y,
      ));
    }
  }
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
    return new Room(leaf.x, leaf.y, leaf.w, leaf.h, leaf.id);
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
