const pm2 = require('pm2');
const bunyan = require('bunyan');
const StdoutStream = require('bunyan-stdout-stream').default;

const logger = bunyan.createLogger({
	name   : 'pm2',
	streams: [{
		level : 'trace',
		type  : 'raw',
		stream: new StdoutStream(),
	}]
});


pm2.launchBus((error, bus) => {
	if (error) {
		logger.error({
			message: 'bus error',
			error
		});
	}
	
	bus.on('process:event', (packet) => {
		const {
			event,
			manually,
			process: {
				name,
				pm_id,
			}
		} = packet;
		
		/*pm2.describe(pm_id, (error, res) => {
			logger.info({
				error,
				res: res[0],
				message: 'list'
			});
		});*/
		
		logger.info({
			message: 'packet',
			event,
			name,
			pm_id,
			manually
		});
	});
});
//start, exit, restart
