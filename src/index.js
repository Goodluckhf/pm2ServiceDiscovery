import bunyan          from 'bunyan';
import pm2             from 'pm2';
import StdoutStream    from 'bunyan-stdout-stream';
import Pm2Module       from './Pm2Module';

const logger = bunyan.createLogger({
	name   : 'pm2',
	streams: [{
		level : 'trace',
		type  : 'raw',
		stream: new StdoutStream(),
	}],
});

const module = new Pm2Module(logger, pm2, {
	events: ['start', 'restart', 'exit'],
});

module.startListen();
//start, exit, restart
