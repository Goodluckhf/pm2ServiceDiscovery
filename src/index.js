import bunyan          from 'bunyan';
import pm2             from 'pm2';
import pmx             from 'pmx';
import StdoutStream    from 'bunyan-stdout-stream';
import bluebird        from 'bluebird';
import express         from 'express';
import bodyParser      from 'body-parser';

import Pm2ServiceDiscovery from './Pm2ServiceDiscovery';
import makeServicesRoute   from './routes/services';

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
		'X-Consul-Index'                : index ? parseInt(index, 10) : 1,
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


let oldConfig = null;
router.get('/v1/catalog/service/:service', async (req, res) => {
	console.log(req.url);
	const actualConfig = serviceDiscovery.getActualConfig();
	
	// Если модуль только стартанул,
	// надо сразу сгенерировать и отдать конфиг
	if (!actualConfig) {
		const generatedConfig = await serviceDiscovery.generateConfig();
		res.json(generatedConfig.getRawObject());
		return;
	}
	
	// Сам long polling
	// По таймауту, если конфиг не изменился
	// Отдаем текущий актуальный
	let responseSent = false;
	let interval     = null;
	const timeout = setTimeout(() => {
		clearInterval(interval);
		if (responseSent) {
			return;
		}
		
		responseSent = true;
		res.json(actualConfig.getRawObject());
	}, config.polling_interval);
	
	interval = setInterval(() => {
		const actualConfigForIteration = serviceDiscovery.getActualConfig();
		if (actualConfigForIteration.equals(oldConfig)) {
			return;
		}
		
		clearTimeout(timeout);
		clearInterval(interval);
		oldConfig = actualConfigForIteration;
		const newConfig = serviceDiscovery.getActualConfig();
		res.json(newConfig.getRawObject());
	}, 1000);
});

app.use('/', router);

app.get('*', (req, res) => {
	console.log('!!!!', req.url);
	res.status(404).send('Not Found');
});
app.listen(config.pm2_service_discovery_port);

serviceDiscovery.startListen();
