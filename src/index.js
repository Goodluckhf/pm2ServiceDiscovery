import bunyan          from 'bunyan';
import pm2             from 'pm2';
import pmx             from 'pmx';
import StdoutStream    from 'bunyan-stdout-stream';
import bluebird        from 'bluebird';
import express         from 'express';
import bodyParser      from 'body-parser';

import Pm2ServiceDiscovery from './Pm2ServiceDiscovery';
import makeServicesRoute   from './routes/services';
import makeServiceRoute    from './routes/service';

bluebird.promisifyAll(pm2);

const logger = bunyan.createLogger({
	name   : 'pm2',
	streams: [{
		level : 'trace',
		type  : 'raw',
		stream: new StdoutStream(),
	}],
});

const config = pmx.initModule();
const serviceDiscovery = new Pm2ServiceDiscovery(logger, pm2, config);


const app = express();
app.use((req, res, next) => {
	const { index } = req.query;
	
	res.set({
		'X-Consul-Effective-Consistency': 'leader',
		'X-Consul-Knownleader'          : true,
		'X-Consul-Lastcontact'          : 0,
		'X-Consul-Index'                : index ? parseInt(index, 10) + 1 : 1,
	});
	next();
});

app.use(bodyParser.json({ limit: '5mb' }));
const router = express.Router();

//eslint-disable-next-line
router.use((error, req, res, next) => {
	logger.error({ error });
	res.status(500).send('Internal server error');
});

router.get('/v1/catalog/services', makeServicesRoute(config));
router.get('/v1/catalog/service/:service', makeServiceRoute(config, serviceDiscovery));

// Беcполезный роут
// Но прометеус не может без него
router.get('/v1/agent/self', (req, res) => {
	console.log(req.url);
	
	return res.json({
		Config: {
			Datacenter: 'dc1',
			NodeID    : '9d754d17-d864-b1d3-e758-f3fe25a9874f',
			Server    : 'true',
		},
	});
});


app.use('/', router);
app.get('*', (req, res) => {
	console.log('!!!!', req.url);
	res.status(404).send('Not Found');
});
app.listen(config.pm2_service_discovery_port);

serviceDiscovery.startListen();
