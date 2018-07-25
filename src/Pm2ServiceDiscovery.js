import Config from './Config';

export default class {
	constructor(logger, pm2, config) {
		this.logger = logger;
		this.pm2    = pm2;
		this.config = config;
		this.bus    = null;
		this.lastConfig   = null;
		this.actualConfig = null;
	}
	
	/**
	 * @returns {boolean}
	 */
	isConfigChanged() {
		return this.actualConfig !== this.lastConfig;
	}
	
	/**
	 * @returns {Promise<Config>}
	 */
	async getActualConfig() {
		if (!this.actualConfig) {
			const apps = await this.pm2.listAsync();
			this.actualConfig = await this.generateConfigByApps(apps);
		}
		
		return this.actualConfig;
	}
	
	/**
	 * Порт = базовый порт из конфига (9100) + pm_id
	 * @param {[{}]} apps
	 * @returns {[{}]}
	 */
	filterApps(apps) {
		const regExp = new RegExp(`^${this.config.app_name_filter}`, 'i');
		return apps
			.filter(app => regExp.test(app.name))
			.map((app) => {
				return {
					host: this.config.target_host,
					port: this.config.target_base_port + app.pm_id,
				};
			});
	}
	
	/**
	 * @param {[{}]} apps
	 * @returns {Config}
	 */
	generateConfigByApps(apps) {
		const filteredApps = this.filterApps(apps);
		return Config.create(filteredApps);
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
		
		const config = await this.generateConfigByApps(apps);
		this.lastConfig   = this.actualConfig;
		this.actualConfig = config;
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
