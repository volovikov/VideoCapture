var Service = require('node-windows').Service;

// Create a new service object
var svc = new Service({
  name: 'VideoCapture nodejs service',
  description: 'VideoVapture nodejs service',
  script: 'c:/VideoCapture/run.js',
  nodeOptions: [
    '--harmony',
    '--max_old_space_size=4096'
  ],
  workingDirectory: 'c:/VideoVapture'
});

// Listen for the "install" event, which indicates the
// process is available as a service.
svc.on('install',function(){
  svc.start();
});

svc.install();
