var ligthSensorPin = P2,
    motionSensorPin = P1,
    delay = 2000;

var lightSensor = require('lightSensor').connect(ligthSensorPin);
var movement = digitalRead(motionSensorPin);

setInterval(function() {
  console.log({
    lighting: lightSensor.read('lx')
  });
}, delay);

setWatch(function() {
  movement = !movement;

  console.log({
    movement: movement
  });
}, motionSensorPin, {
  repeat: true,
  edge: 'both'
});
