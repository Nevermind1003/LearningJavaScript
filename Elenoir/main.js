'use strict';
const //workerWorld    = new Worker('workerWorld.js'),
      canvas         = document.getElementById('canvas'),
      context        = canvas.getContext('2d'),
      
      reSize = function (){
        canvas.width  = window.innerWidth;
        canvas.height = window.innerHeight;
      }();

window.addEventListener("resize", reSize);

function renderUnit(unit){
    context.beginPath();
    context.strokeStyle= unit.team;
    context.rect(unit.x - unit.size >> 1, unit.y - unit.size >> 1, unit.size, unit.size); 
    context.stroke();
}

//workerWorld.addEventListener('message', function(e) {
function worldStep(world){
  context.clearRect(0,0,canvas.width, canvas.height);

  //let world = e.data.world;


for (let key of Object.keys(world))
    for (let unitKey of Object.keys(world[key]))
        renderUnit(world[key][unitKey]);

}
//}, false);


function handleKey(key, up){
  player.adaptMovement(key, up);
  //workerWorld.postMessage({'key': key, 'up': up});
}

window.onkeyup = function(e) {
  handleKey(e.keyCode ? e.keyCode : e.which, true);
};

window.onkeydown = function(e) {
  handleKey(e.keyCode ? e.keyCode : e.which, false);
};


/////thread
var globalObjectId = 0;

function getId(){
  globalObjectId++;
  return globalObjectId;
}

class Unit {

  constructor(x, y, team){
    this.x = x;
    this.y = y;
    this.size = 10;
    this.team = team;
    this.objectId = getId();
  }
  
  die(){
    world.removeUnit(this);
  }

  reposition(){
    let position = {};
        position.x = this.x + Math.round((Math.random() - 0.5) * 4);
        position.y = this.y + Math.round((Math.random() - 0.5) * 4);
    return position;
  }

  checkCollision(target){
    console.log('checkCollision');  
    if ((this.team == target.team))
      return false;
    let size = this.size + target.size;
    if(Math.abs(this.x - target.x) <  size || Math.abs(this.y - target.y) <  size){
      if(target.team == 'red')
        target.die();
      if(this.team == 'red')
        this.die();
      return true;
    }
    
    return false;
  }

  move(){
    let pos = this.reposition(),
        xTile = this.x >> 6,
        yTile = this.y >> 6,
        newXTile = pos.x >> 6,
        newYTile = pos.y >> 6;

    for(let key of Object.keys(world[xTile + '_' + yTile])){
      if(key !== this.objectId && this.checkCollision(world[xTile + '_' + yTile][key]))
        return;
    }    

    if((newXTile != xTile) || (newYTile != yTile)){
      world.removeUnit(this);
      this.x = pos.x;
      this.y = pos.y;
      world.addUnit(this);
    }else{
      this.x = pos.x;
      this.y = pos.y;
    }
  }
}

class Player extends Unit {
  
  constructor(x, y, team){
    super(x,y, team);
    this.movementX = 0;
    this.movementY = 0;
  }
  
  reposition(){
    let position = {};
        position.x = this.x + this.movementX;
        position.y = this.y + this.movementY;
    return position;
  }

  adaptMovement(key, up){
    switch(key){
      case 37: //leftArrow
        if (up)
          this.movementX = 0;
        else
          this.movementX = -1;
        break;
      case 38: //upArrow
        if (up)
          this.movementY = 0;
        else
          this.movementY = -1;
        break;
      case 39: //rightArrow
        if (up)
          this.movementX = 0;
        else
          this.movementX = 1;
        break;
      case 40: //downArrow
        if (up)
          this.movementY = 0;
        else
          this.movementY = 1;
        break;
    }
  }
  
  move(){
    super.move();
  }
}

class World{
  constructor(){
  }

  addUnit(unit){
    let xTile = unit.x >> 6,
        yTile = unit.y >> 6,
        str   = xTile + '_' + yTile;
    console.log('addUnit : ' + str);
    
    if(!this[str])
     this[str] = [];
    
    this[str][unit.objectId] = unit;
  }

  removeUnit(unit){
    let xTile = unit.x >> 6,
        yTile = unit.y >> 6,
        str   = xTile + '_' + yTile;
    console.log('removeUnit : ' + str);
      delete this[str][unit.objectId];
      if(Object.keys(this[str]).length === 0)
        delete this[str];
  }
  
  step(){
    for (let arreaKey of Object.keys(this)){
      for (let unitKey of Object.keys(this[arreaKey])){
        //TODO Problem if a unit get killed and deleted his key still exist in this for loop and nullpointer is thrown
        if(this[arreaKey] && this[arreaKey][unitKey])
          this[arreaKey][unitKey].move();
      }
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
      let u = new Unit(this.x, this.y, this.team);
      world.addUnit(u);
    }
  }
}

class Drone extends Unit{
    
  constructor(x, y, team){
    super(x,y, team);
    this.lifeTime = 100;
  }

  move(){
    super.move();
    this.lifeTime--;

    if (this.lifeTime === 0) {
      this.die();
      let b = new Building(this.x, this.y, this.team);
      world.addUnit(b);
    }
  }
}

const world = new World();
var player = new Player(250, 100, "blue");
world.addUnit(player);
world.addUnit(new Drone(100, 100, "red"));

function getKeyString(array){
  let str = ' ';
  for(let i of array)
    str += ' - ' + i.toString();
  
  return str;
}
  
function mainLoop(){
  world.step();
  worldStep(world);
//  self.postMessage({'world': world});
  setTimeout(mainLoop, 20);
}
mainLoop();

//self.addEventListener('message', function(e) {
//  player.adaptMovement(e.data.key, e.data.up);
//}, false);
