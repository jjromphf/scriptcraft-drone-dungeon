// jsdoc here
var Vector2 = function(x, y) {
  this.x = x;
  this.y = y;
}

Vector2.prototype.distanceTo = function(vec) {
  return Math.sqrt(this.distanceToSquared(vec));
}

Vector2.prototype.distanceToSquared = function(vec) {
  var distanceX = this.x - vec.x;
  var distanceY = this.y - vec.y;
  return distanceX * distanceX + distanceY * distanceY;
}

var Path = function(start, end) {
  this.start = start;
  this.end = end;
  this.distance = this.start.distanceTo(this.end);
}

// jsdoc here
var Rectangle = function(x, y, w, h) {
  this.x = x;
  this.y = y;
  this.w = w;
  this.h = h;
  this.centroid = new Vector2(
    this.x + (this.w / 2),
    this.y + (this.h / 2)
  );
  this.aspect = this.w / this.h;
  // area calculations and other stuff goes here
}

/*Rectangle.prototype.pathToSibling = function(rec) {
  return new Path(this.center)
}*/

module.exports = {
  Vector2: Vector2,
  Rectangle: Rectangle,
}
