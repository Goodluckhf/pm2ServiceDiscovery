import pm2          from 'pm2';
import bunyan       from 'bunyan';
import StdoutStream from 'bunyan-stdout-stream';

const logger = bunyan.createLogger({
	name   : 'pm2',
	streams: [{
		level : 'trace',
		type  : 'raw',
		stream: new StdoutStream(),
	}],
});

pm2.launchBus((error, bus) => {
	if (error) {
		logger.error({
			message: 'bus error',
			error,
		});
	}
	
	bus.on('process:event', (packet) => {
		const {
			event,
			manually,
			process: {
				name,
				//eslint-disable-next-line
				pm_id,
			},
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
			manually,
		});
	});
});
//start, exit, restart
