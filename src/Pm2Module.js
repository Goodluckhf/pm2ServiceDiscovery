import Config from './Config';

export default class {
	constructor(logger, pm2, config) {
		this.logger = logger;
		this.pm2    = pm2;
		this.config = config;
	}
	
	//eslint-disable-next-line class-methods-use-this
	async generateConfig(opts) {
		Config.create(opts);
	}
	
	async onProcessHandler(packet) {
		const {
			event,
			manually,
			process: {
				name,
				//eslint-disable-next-line
				pm_id,
			},
		} = packet;
		
		if (!this.config.events.includes(event)) {
			return;
		}
		
		this.logger.info({
			message: 'packet',
			event,
			name,
			pm_id,
			manually,
		});
		await this.generateConfig();
	}
	
	startListen() {
		return new Promise((resolve, reject) => {
			this.pm2.launchBus((error, bus) => {
				if (error) {
					this.logger.error({
						message: 'bus error',
						error,
					});
					return reject(error);
				}
				
				bus.on('process:event', (...args) => {
					this.onProcessHandler(...args);
				});
				
				return resolve();
			});
		});
	}
	
	stopListen() {
		if (!this.pm2.Client || !this.pm2.Client.sub) {
			return;
		}
		
		this.pm2.Client.sub.off('process:event');
	}
}
