// jsdoc here
var Vector2 = function(x, y) {
  this.x = x;
  this.y = y;
}

Vector2.prototype.distanceTo = function(vec) {
  return Math.sqrt(this.distanceToSquared(vec));
}

Vector2.prototype.multiply = function(vec) {
  this.x *= vec.x;
  this.y *= vec.y;
  return this;
}

Vector2.prototype.divide = function(vec) {
  this.x /= vec.x;
  this.y /= vec.y;
  return this;
}

Vector2.prototype.distanceToSquared = function(vec) {
  var distanceX = this.x - vec.x;
  var distanceY = this.y - vec.y;
  return distanceX * distanceX + distanceY * distanceY;
}

Vector2.prototype.clone = function() {
  return new Vector2(this.x, this.y);
}

var Path = function(start, end) {
  this.start = start;
  this.end = end;
  this.w = this.end.x - this.start.x;
  this.h = this.end.y - this.start.y;
  this.direction = this.getDirection();
  this.distance = this.start.distanceTo(this.end);
}

Path.VERTICAL = 'VERTICAL';
Path.HORIZONTAL = 'HORIZONTAL';

Path.prototype.intersectsRect = function(rect) {
  return (
    rect.x < this.start.x + this.w &&
    rect.x + rect.w > this.start.x &&
    rect.y < this.start.y + this.h &&
    rect.h + rect.y > this.start.y === true
  );
}

Path.prototype.containsPoint = function(point) {
  if (this.direction === Path.VERTICAL) {
    return(
      point.x === this.start.x || point.x === this.end.x &&
      point.y < this.start.y + this.h === true
    );
  } else {
    return (
      point.y === this.start.y || point.y === this.end.y &&
      point.x < this.start.x + this.w === true
    );
  }
}

Path.prototype.getDirection = function() {
  if (this.w > this.h) return Path.HORIZONTAL;
  return Path.VERTICAL;
}

// jsdoc here
var Rectangle = function(x, y, w, h) {
  this.x = x;
  this.y = y;
  this.w = w;
  this.h = h;
  this.top = new Path(
    new Vector2(this.x, this.y),
    new Vector2(this.x + this.w, this.y)
  );
  this.bottom = new Path(
    new Vector2(this.x, this.y + this.h),
    new Vector2(this.x + this.w, this.y + this.h)
  );
  this.right = new Path(
    this.top.end,
    this.bottom.end
  );
  this.left = new Path(
    this.top.start,
    this.bottom.start
  );
  this.centroid = new Vector2(
    this.x + (this.w / 2),
    this.y + (this.h / 2)
  );
  this.v_aspect = this.w / this.h;
  this.h_aspect = this.h / this.w;
  // area calculations and other stuff goes here
}

Rectangle.SIDES = {
  TOP: 'top',
  BOTTOM: 'bottom',
  LEFT: 'left',
  RIGHT: 'right',
}

Rectangle.prototype.containsPoint = function(point) {
  return (
    this.x <= point.x &&
    point.x <= this.right.end.x &&
    this.y <= point.y &&
    point.y <= this.bottom.end.y === true
  );
}

module.exports = {
  Vector2: Vector2,
  Rectangle: Rectangle,
  Path: Path,
}
