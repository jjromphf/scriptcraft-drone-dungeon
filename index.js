// ScriptCraft modules
var Drone = require('drone');
var utils = require('utils');
var blocks = require('blocks');

// our stuff

var DungeonLayout = require('./dungeon-layout');
var Vector2 = require('./geom').Vector2;
var Rectangle = require('./geom').Rectangle;
var randomInt = require('./utils').randomInt;

var sideDir = {
    top: 1,
    bottom: 3,
    left: 2,
    right: 0
}

var LIGHTMODES = {
  dark: 0,
  dim: 1,
  medium: 2,
  bright: 3
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

  var drone = this;
  // TODO this dont work
  var DOORTYPES = {
    door: function() { drone.door() },
    door2: function() { drone.door2() },
    iron: function() { drone.door_iron() },
    door2_iron: function() { drone.door2_iron() },
    random: function() {
      var doorTypes = [];
      for (var key in DOORTYPES) {
        if (key !== 'random') doorTypes.push(DOORTYPES[key]);
      }
      doorTypes[randomInt(0, doorTypes.length-1)]();
    }
  }

  var DEFAULTS = {
    iterations: 4,
    blockType: blocks.stone,
    depth: 5,
    lightMode: LIGHTMODES.medium,
    doorType: DOORTYPES.random,
    // door type
    // block type
    // depth
    // n floors
  }


  var iterations = options.iterations ? options.iterations : DEFAULTS.iterations;
  var blockType = options.blockType ? options.blockType : DEFAULTS.blockType;
  var depth = options.depth ? options.depth : DEFAULTS.depth;
  var doorType = options.doorType ? options.doorType : DEFAULTS.doorType;
  var lightMode = options.lightMode ? options.lightMode : DEFAULTS.lightMode;
  var location = this.getLocation();
  this.dungeon.layout = new DungeonLayout(location.x, location.z, w, h, iterations);
  // must be facing east
  this.move(location.x, location.y, location.z);
  this.chkpt('dungeon-start');
  var startDir = this.dir;
  // make all the rooms
  var roomCnt = 0;
  var dl = this.dungeon.layout;
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
    for (var i = 0; i < room.doors.length; i++) {
      var door = room.doors[i];
      var dt = getTransform(door.pos.x, location.y, door.pos.y, room.w, room.h);
      // add a torch beside the door
      drone.move(dt.x, location.y, dt.z, sideDir[door.side]);
      doorType();
      if (lightMode > 0) {
        drone.left(2)
        .up()
        .turn(2)
        .back()
        .hangtorch();
      }
      roomCnt += 1;
    }
  }
  var hasNext = function() {
    if (roomCnt < dl.rooms.length) return true;
    return false;
  }
  var onDone = function() {
    drone.move('dungeon-start');
    drone.back()
    .box0(blockType, w+2, depth, h+2);
    var location = drone.getLocation();
    drone.move(location.x, location.y - 1, location.z);
    drone.box(blockType, w+2, 1, h+2)
    drone.move(location.x, location.y+depth, location.z)
    .fwd()
    .right()
    .chkpt('dungeon-ceiling');
    placeHiddenLights(lightMode);
    drone.move('dungeon-start')
    .back()
    .right(10)
    .door();

    drone.move('dungeon-start');
    echo('Dungeon done');
  }

  var placeHiddenLights = function(lightMode) {
    drone.move('dungeon-ceiling')
    .down()
    .box(blocks.carpet.lightgray, w, 1, h);
    if (lightMode === 2) {
      drone.move('dungeon-ceiling')
      .box0(blocks.glowstone, w, 1, h);
    }
    if (lightMode === 3) {
      drone.move('dungeon-ceiling')
      .box(blocks.glowstone, w, 1, h);
    }
    drone.move('dungeon-ceiling')
    .back()
    .left()
    .box0(blockType, w+2, 1, h+2)
    .move('dungeon-ceiling')
    .back()
    .left()
    .up()
    .box(blockType, w+2, 1, h+2);
  }

  utils.nicely(next, hasNext, onDone, 50);
  // move back to the start (local 0,0 in our layout)
}


module.exports = function(){
    Drone.extend(dungeon);
}
