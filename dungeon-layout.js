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

Room.sides = function() {
  var sides = [];
  for (var key in Rectangle.SIDES) {
    sides.push(Rectangle.SIDES[key]);
  }
  return sides;
}

Room.prototype.randomPerimeterPoint = function() {
  var side = Room.sides()[randomInt(0, 3)];
  var wall = this[side];
  var pos;
  if (wall.direction === Path.VERTICAL) {
    var startX = (side === 'left') ? wall.start.x : wall.start.x - 1;
    pos = new Vector2(startX, randomInt(wall.start.y + 2, wall.end.y - 2));
  } else {
    var startY = (side === 'top') ? wall.start.y : wall.start.y - 1;
    pos = new Vector2(randomInt(wall.start.x + 2, wall.end.x - 2), startY);
  }
  return pos;
}

// could put in a minimum door distance if they fall too close together
Room.prototype.makeDoors = function(nDoors) {
  var pos;
  var nSides = (nDoors > 4) ? 4 : nDoors;
  var sides = Room.sides().slice(0, nSides);
  for (i = 0; i < nDoors; i++) {
    var side = sides[i];
    var wall = this[side];
    this.doors.push(new Door(wall.center, side));
  }
}

Door = function(pos, side) {
  this.pos = pos;
  this.side = side;
}

Room.prototype.pointIntersectsWall = function(point) {
  for (var key in Rectangle.SIDES) {
    var wall = this[Rectangle.SIDES[key]];
    if (wall.containsPoint(point)) return true;
  }
  return false;
}

var DungeonLayout = function(x, y, w, h, nIterations, options) {
  this.x = x;
  this.y = y;
  this.w = w;
  this.h = h;
  this.area = this.w * this.h;
  this.nIterations = nIterations;
  this.options = options;
  var map = new Rectangle(x, y, this.w, this.h);
  this.tree = BSPTree.splitRect(map, this.nIterations);
  this.leaves = this.tree.getLeaves();
  this.rooms = [];
  this.makeRooms();
}

DungeonLayout.prototype.makeRooms = function() {
  this.rooms = this.leaves.map(function(leaf) {
    return new Room(leaf.x, leaf.y, leaf.w, leaf.h, leaf.id);
  });
}

DungeonLayout.prototype.getRoomByContainerId = function(id) {
  return this.rooms.find(function(room) {
    return room.containerId === id;
  });
}

DungeonLayout.prototype.pointIntersectsWall = function(point) {
  var container = this.tree.nearestLeaf(point);
  if (!container) return false;
  var room = this.getRoomByContainerId(container.id);
  if (!room) return false;
  return room.pointIntersectsWall(point);
}

DungeonLayout.prototype.regenerate = function(width, height, nIterations) {
  this.width = width ? width : this.width;
  this.height = height ? height : this.height;
  this.nIterations = nIterations ? nIterations : this.nIterations;
  var map = new Rectangle(0, 0, width, height);
  this.tree = BSPTree.splitRect(map, this.nIterations);
  this.makeRooms();
}

module.exports = DungeonLayout;
