'use strict';
const workerWorld    = new Worker('workerWorld.js'),
      canvasTerrain  = document.getElementById('canvasTerrain'),
      canvasUnits    = document.getElementById('canvasUnits'),
      contextTerrain = canvasTerrain.getContext('2d'),
      contextUnits   = canvasUnits.getContext('2d');
      
var reSize = function (){
  let width  = window.innerWidth,
      height = window.innerHeight;
  
  canvasTerrain.width  = width;
  canvasTerrain.height = height;
  canvasUnits.width    = width;
  canvasUnits.height   = height;
}();

window.addEventListener("resize", reSize);


workerWorld.addEventListener('message', function(e) {
  contextUnits.clearRect(0,0,canvasUnits.width, canvasUnits.height);
  contextUnits.lineWidth="5";
  contextUnits.strokeStyle='red';
  
  contextTerrain.fillStyle = "green";  
  contextTerrain.fillRect(0,0,canvasTerrain.width,canvasTerrain.height);
  contextTerrain.fill();
  let units = e.data.units;
  
  for (let i = 0; i < units.length; i++) {
    if (units[i])
      renderUnit(units[i]);
  }
  
}, false);

function renderUnit(unit){
    contextUnits.beginPath();
    contextUnits.strokeStyle= unit.team;
    contextUnits.rect(unit.x - (unit.size / 2) >> 0, unit.y - (unit.size / 2) >> 0, unit.size, unit.size); 
    contextUnits.stroke();
};
    
function handleKey(key, up){
  workerWorld.postMessage({'key': key, 'up': up});
}

window.onkeyup = function(e) {
  //e.preventDefault();
  var key = e.keyCode ? e.keyCode : e.which;
  
  handleKey(key, true);
}

window.onkeydown = function(e) {
  //e.preventDefault();
  var key = e.keyCode ? e.keyCode : e.which;
  
  handleKey(key, false);
}