var DungeonLayout = require('./dungeon-layout');
const { Canvas, backends } = require('canvas');
const fs = require('fs');
const { Vector2 } = require('./geom');

var imagebackend = new backends.ImageBackend(800, 800);

var randomInt = require('./utils').randomInt;
var dl = new DungeonLayout(500, 500, 4);
var canvas = new Canvas(imagebackend);
var ctx = canvas.getContext('2d');

const square = canvas.width / 50;

dl.tree.getLeaves().forEach((leaf) => {
  ctx.strokeStyle = "green";
  ctx.lineWidth = 2;
  ctx.strokeRect(leaf.x, leaf.y, leaf.w, leaf.h);
});

dl.rooms.forEach((room) => {
  ctx.fillStyle = "#fff";
  ctx.fillRect(room.x, room.y, room.w, room.h);
});

dl.rooms.forEach((room, index) => {
  var color = '#ccc';
  ctx.fillStyle = color;
  ctx.fillRect(room.x, room.y, room.w, room.h);
});

let testRec = dl.tree.nearestLeaf(new Vector2(400, 100));
console.log(testRec);
ctx.strokeStyle = "red";
ctx.lineWidth = 2;
ctx.strokeRect(testRec.x, testRec.y, testRec.w, testRec.h);



canvas.createPNGStream().pipe(fs.createWriteStream('dungeon.png'));
