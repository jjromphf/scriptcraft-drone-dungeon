// ScriptCraft modules
var Drone = require('drone');
var utils = require('utils');
var blocks = require('blocks');

// our stuff

var DungeonLayout = require('./dungeon-layout');
var Vector2 = require('./geom').Vector2;
var Rectangle = require('./geom').Rectangle;

var DEFAULTS = {
  iterations: 4,
  blockType: blocks.stone,
  depth: 5,
  // door type
  // block type
  // depth
  // n floors
}

function getDoorDirection(side) {
  switch(side) {
    case 'top':
      return 3;

    case 'bottom':
      return 2;

    case 'left':
      return 0;

    case 'right':
      return 1;

    default:
      return 0;

  }
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
  this.box0(blockType, w, depth, h);
  // make all the rooms
  var roomCnt = 0;
  var dl = this.dungeon.layout;
  var drone = this;
  var next = function() {
    var room = dl.rooms[roomCnt];
    drone.move('dungeon-start');
    console.log(drone.dir);
    drone.move(room.x, location.y, room.y);
    drone.box0(blockType, room.w, depth, room.h);
    // TODO add doors
    for (var i = 0; i < room.doors.length; i++) {
      var door = room.doors[i];
      drone.move('dungeon-start');
      drone.move(door.pos.x, location.y, door.pos.y, getDoorDirection(door.side));
      // debugging
      switch(door.side) {
        case 'top':
          drone.door();
          break;

        case 'bottom':
          drone.door2();
          break;

        case 'left':
          drone.door_iron();
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
    this.move('dungeon-start');
    // make the floor
    this.up(depth);
    //this.box(blockType, w, 1, h);
    this.move('dungeon-start')
    .up()
    .door();
    this.move('dungeon-start');
    echo('Dungeon done');
  }
  utils.nicely(next, hasNext, onDone, 50);
  // move back to the start (local 0,0 in our layout)
}


module.exports = function(){
    Drone.extend(dungeon);
}
