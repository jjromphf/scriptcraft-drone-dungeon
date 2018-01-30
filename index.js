// ScriptCraft modules
var Drone = require('drone');
var utils = require('utils');
var blocks = require('blocks');

// our stuff

var DungeonLayout = require('./dungeon-layout');
var Vector2 = require('./geom').Vector2;
var Rectangle = require('./geom').Rectangle;

var sideDir = {
    top: 1,
    bottom: 3,
    left: 2,
    right: 0
}

var DEFAULTS = {
  iterations: 4,
  blockType: blocks.stone,
  depth: 5,
  // door type
  // block type
  // depth
  // n floors
}

function dungeon(w, h, options) {
  /*
  algorithm works like this:
  move drone to xyz
  take x,y,z,w,h and draw containing box at that position using box()
  draw all rooms inside containing box based on their local transform using box0()
  add all doors to the rooms based on their local transform using door()
  use utils.nicely() to process each room
  */

  var iterations = options.iterations ? options.iterations : DEFAULTS.iterations;
  var blockType = options.blockType ? options.blockType : DEFAULTS.blockType;
  var depth = options.depth ? options.depth : DEFAULTS.depth;
  var location = this.getLocation();
  this.dungeon.layout = new DungeonLayout(location.x, location.z, w, h, iterations);
  // must be facing east
  this.move(location.x, location.y, location.z);
  this.chkpt('dungeon-start');
  var startDir = this.dir;
  // make all the rooms
  var roomCnt = 0;
  var dl = this.dungeon.layout;
  var drone = this;
  var getTransform = function(x, y, z, width, height) {
    var transform = {}
    transform.w = height;
    transform.h = width;
    transform.dir = 0;
    switch(startDir) {
      // east
      case 0:
        transform.x = x;
        transform.y = y;
        transform.z = z;
        break;
      // south
      case 1:
        transform.x = x - w;
        transform.y = y;
        transform.z = z;
        break;
      // west
      case 2:
        transform.x = x - w;
        transform.y = y;
        transform.z = z - h;
        break;
      // north
      case 3:
        transform.x = x;
        transform.y = y;
        transform.z = z - h;
        break;
    }
    return transform;
  }
  var next = function() {
    var room = dl.rooms[roomCnt];
    var transform = getTransform(room.x, location.y, room.y, room.w, room.h);
    drone.move(transform.x, transform.y, transform.z, transform.dir);
    drone.box0(blockType, transform.w, depth, transform.h);

    // TODO add doors
    for (var i = 0; i < room.doors.length; i++) {
      var door = room.doors[i];
      var dt = getTransform(door.pos.x, location.y, door.pos.y, room.w, room.h);

      drone.move(dt.x, location.y, dt.z, sideDir[door.side]);
      // debugging
      switch(door.side) {
        case 'top':
          drone.door();
          break;

        case 'bottom':
          drone.door_iron();
          break;

        case 'left':
          drone.door2();
          break;

        case 'right':
          drone.door2_iron();
          break;
      }
    }
    roomCnt += 1;
  }
  var hasNext = function() {
    if (roomCnt < dl.rooms.length) return true;
    return false;
  }
  var onDone = function() {
    drone.move('dungeon-start');
    drone.box0(blockType, w+1, depth, h+1);

    /*var location = drone.getLocation();
    drone.move(location.x - w, location.y, location.z, 3)

    drone.door();*/
    /*this.move('dungeon-start');
    // make the floor
    this.up(depth);
    //this.box(blockType, w, 1, h);
    this.move('dungeon-start')
    .up()
    .door();
    this.move('dungeon-start');
    echo('Dungeon done');*/
  }
  utils.nicely(next, hasNext, onDone, 50);
  // move back to the start (local 0,0 in our layout)
}


module.exports = function(){
    Drone.extend(dungeon);
}
