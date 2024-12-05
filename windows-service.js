const Service = require('node-windows').Service;

// Define the service
const svc = new Service({
    name: 'PeakUnifyPrinter',
    description: 'Peak unify printer service',
    script: 'service.exe', // Path to the script you want to run as a service
    execPath: process.execPath, // Ensure it uses the current Node.js binary
    env: {
        name: 'NODE_ENV',
        value: 'production',
    }
});

// Listen for the "install" event to start the service after installation
svc.on('install', () => {
    console.log('Service installed');
    svc.start();
});

// Check if the service is already installed
if (!svc.exists) {
    svc.install(); // Install the service
} else {
    console.log('Service already exists');
}
