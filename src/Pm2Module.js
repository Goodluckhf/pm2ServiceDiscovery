import Config from './Config';

export default class {
	constructor(logger, pm2, config) {
		this.logger = logger;
		this.pm2    = pm2;
		this.config = config;
		this.bus    = null;
		this._generatedConfig = new Config();
	}
	
	get generatedConfig() {
		return this._generatedConfig;
	}
	// Порт = базовый порт из конфига (9100) + pm_id
	filterApps(apps) {
		const regExp = new RegExp(`^${this.config.appNameFilter}`, 'i');
		return apps
			.filter(app => regExp.test(app.name))
			.map(app => `${this.config.host}:${this.config.port_base + app.pm_id}`);
	}
	
	async generateConfigByApps(apps) {
		const filteredApps = this.filterApps(apps);
		this.logger.info({ ...filteredApps });
		this._generatedConfig = Config.create(filteredApps);
	}
	
	
	async onProcessHandler(packet) {
		const {
			event,
			process: {
				name,
			},
		} = packet;
		
		if (!this.config.events.includes(event)) {
			return;
		}
		
		this.logger.info({
			message: 'packet',
			event,
			name,
		});
		const apps = await this.pm2.listAsync();
		
		await this.generateConfigByApps(apps);
	}
	
	startListen() {
		return new Promise((resolve, reject) => {
			if (this.bus) {
				this.bus.on('process:event', this.onProcessHandler.bind(this));
				return resolve();
			}
			
			return this.pm2.launchBus((error, bus) => {
				if (error) {
					this.logger.error({
						message: 'bus error',
						error,
					});
					return reject(error);
				}
				
				this.bus = bus;
				this.bus.on('process:event', this.onProcessHandler.bind(this));
				return resolve();
			});
		});
	}
	
	stopListen() {
		if (!this.bus) {
			return;
		}
		
		this.bus.off('process:event');
	}
}
