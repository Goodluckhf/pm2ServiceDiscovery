import bunyan          from 'bunyan';
import pm2             from 'pm2';
import pmx             from 'pmx';
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

const config = pmx.initModule();

const module = new Pm2Module(logger, pm2, config);

module.startListen();
//start, exit, restart
