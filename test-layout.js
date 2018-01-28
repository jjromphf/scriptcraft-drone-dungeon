var DungeonLayout = require('./src/dungeon-layout');
const { Canvas, backends } = require('canvas');
const fs = require('fs');
const { Vector2 } = require('./src/geom');

var imagebackend = new backends.ImageBackend(800, 800);

var randomInt = require('./src/utils').randomInt;
var dl = new DungeonLayout(new Vector2(753, 891), 500, 500, 4);
var canvas = new Canvas(imagebackend);
var ctx = canvas.getContext('2d');

const square = canvas.width / 50;

dl.leaves.forEach((leaf) => {
  ctx.strokeStyle = "green";
  ctx.lineWidth = 2;
  ctx.strokeRect(leaf.x, leaf.y, leaf.w, leaf.h);
});

dl.rooms.forEach((room) => {
  ctx.fillStyle = "#fff";
  ctx.fillRect(room.x, room.y, room.w, room.h);
  ctx.fillStyle = "#000";
  room.doors.forEach((door) => {
    ctx.fillRect(door.local.x, door.local.y, 5, 5);
  });
});

let testRec = dl.tree.nearestLeaf(new Vector2(250, 250));
ctx.strokeStyle = "red";
ctx.lineWidth = 2;
ctx.strokeRect(testRec.x, testRec.y, testRec.w, testRec.h);

canvas.createPNGStream().pipe(fs.createWriteStream('dungeon.png'));
