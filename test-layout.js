var DungeonLayout = require('./dungeon-layout');
var randomInt = require('./utils').randomInt;
var dl = new DungeonLayout(500, 500, 4);
console.log(dl.tree.getNodes());
//console.log(dl.tree.getNodes().length);
