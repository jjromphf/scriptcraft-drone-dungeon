# scriptcraft-drone-dungeon
Example Module for BSP Dungeon Generation in ScriptCraft

This module can be used in conjunction with ScriptCraft's drone module to produce simple roguelike-style dungeon layouts via [Binary Space Partitioning](https://en.wikipedia.org/wiki/Binary_space_partitioning)

### To Install the drone-dungeon Module
Download the latest [release](https://github.com/jjromphf/scriptcraft-drone-dungeon/files/3725190/drone-dungeon-0.0.1.zip)

Unzip and copy the contents to [your-scriptcraft-directory]/modules

### How to use the Module
First, import both the drone and drone-dungeon modules via the require module:
```
var drone = require(‘Drone’);
var dungeon = require(‘drone-dungeon’)();
```
To build a single-floor 50x50 dungeon at the current location:

`drone.dungeon(50, 50, {}, self.location);`

See the docs for more options.


