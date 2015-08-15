"use strict";
class Unit {
  
  constructor(x, y, team){
    this.x = x;
    this.y = y;
    this.size = 10;
    this.team = team;
  }
  
  toWorld(){
      world[(this.x-this.size)+"_"+(this.y-this.size)] = this;
      world[(this.x-this.size)+"_"+(this.y+this.size)] = this;
      world[(this.x+this.size)+"_"+(this.y-this.size)] = this;
      world[(this.x+this.size)+"_"+(this.y+this.size)] = this;
  }
    
  removeFromWorld(){
    delete world[(this.x-this.size)+"_"+(this.y-this.size)];
    delete world[(this.x-this.size)+"_"+(this.y+this.size)];
    delete world[(this.x+this.size)+"_"+(this.y-this.size)];
    delete world[(this.x+this.size)+"_"+(this.y+this.size)];
  }
  
  inRange(x, y){
    for(let i = x - this.size; i < (x + this.size); i++){
      for(let j = y - this.size; j < (y + this.size); j++){
        if (world[i+"_"+j]) {
          console.log(world[i+"_"+j]);
          return world[i+"_"+j];
        }
      }
    }
    return undefined;
  }
  
  move(){
    this.removeFromWorld();
    this.x = this.x + (Math.random() - 0.5) * 4;
    this.y = this.y + (Math.random() - 0.5) * 4;
    this.toWorld();
  }
  
}

class Krieger extends Unit {
  
  constructor(x, y, team){
    super(x, y, team);
  }
  
  attack(target){
    console.log("what?");
  }
  
}

const leftArrow = 37;
const upArrow = 38;
const rightArrow = 39;
const downArrow = 40;
const space = 32;

class Player extends Unit {
  
  constructor(x, y, team){
    super(x,y, team);
    this.movementX = 0;
    this.movementY = 0;
  }
  
  move(){
    this.removeFromWorld();
    let newX = this.x + this.movementX;
    let newY = this.y + this.movementY;
    let unitInRange = this.inRange(newX, newY);
    
      
    if ((unitInRange != undefined) && (unitInRange.team != this.team)){
      console.log(unitInRange);
      unitInRange = undefined;
    }
    this.x = newX;
    this.y = newY;
    
    this.toWorld();
  }
    
  adaptMovement(key, up){
    if (key === leftArrow) {
        if (up)
          this.movementX = 0;
        else
          this.movementX = -1;
    }
        if (key === rightArrow) {
          if (up)
            this.movementX = 0;
          else
            this.movementX = 1;
        }
        
        if (key === upArrow) {
        if (up)
          this.movementY = 0;
        else
          this.movementY = -1;
    }
        if (key === downArrow) {
          if (up)
            this.movementY = 0;
          else
            this.movementY = 1;
        }
  }
}

class Building extends Unit{
  constructor(x, y, team){
    super(x,y,team);
    this.size = 40;
    this.counter = 0;
    this.population = 0;
  }
  
  move(){
    this.counter++;
    if (this.counter > this.population * this.population) {
      this.population++;
      this.counter = 0;
      units[units.length] = new Unit(this.x, this.y, this.team);
    }
  }
}

var world = {};
var player = new Player(250, 100, "blue");
var units = [];
units[0] = player;
units[1] = new Building(400, 300, "red");

function loop(){
  for (let i = 0; i <units.length; i++) {
    if (units[i])
      units[i].move();
  }
  
  self.postMessage({'units': units});
    
  setTimeout(loop, 20);
}
loop();

function fireArrow(index){
  index++;
  if(index < 500)
    setTimeout(fireArrow(index), 1);
}

self.addEventListener('message', function(e) {
  player.adaptMovement(e.data.key, e.data.up);
}, false);
