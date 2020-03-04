  var lightSensor = require('https://github.com/amperka/espruino-modcat/blob/master/modules/@amperka/light-sensor.js').connect(A3),    
      tempSensor = require('https://www.espruino.com/modules/DHT11.js').connect(A1),
      movement = false, 
      delay = 2000;


setInterval(function() {  
  tempSensor.read(function(v) {    print(`{"lighting":${lightSensor.read('lx')},"temp":${v.temp.toString()},"humidity":${v.rh.toString()}}`);
  });
}, delay);

setWatch(function() {  
  movement = !movement;  
  print(`{"movement":${movement}}`);
}, A4, {  
  repeat: true,  
  edge: 'both'
});