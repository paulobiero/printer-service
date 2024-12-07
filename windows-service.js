const Service = require('node-windows').Service;
var EventLogger = require('node-windows').EventLogger;

var log = new EventLogger('PeakUnifyPrinter');
// Define the service
try {
    const svc = new Service({
        name: 'PeakUnifyPrinter',
        description: 'Peak unify printer service',
        script: 'service.js',
        execPath: process.execPath, // Ensure it uses the current Node.js binary
        env: {
            name: 'NODE_ENV',
            value: 'production',
        }
    });

// Listen for the "install" event to start the service after installation
    svc.on('install', () => {
        console.log('Service installed');
        log.info('Service installed')
        svc.start();
    });

// Check if the service is already installed
    if (!svc.exists) {
        svc.install(); // Install the service
    } else {
        console.log('Service already exists');
        log.info('Service already exists')
    }
}catch (e) {
    log.error(e);
}
