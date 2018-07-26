import Config from './Config';

export default class {
	constructor(logger, pm2, config) {
		this.logger = logger;
		this.pm2    = pm2;
		this.config = config;
		this.bus    = null;
		this.actualConfig = null;
	}
	
	/**
	 * @returns {Config}
	 */
	getActualConfig() {
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
			.filter(app => app.pm2_env.status === 'online')
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
	
	/**
	 * @returns {Promise<Config>}
	 */
	async generateConfig() {
		const apps = await this.pm2.listAsync();
		this.actualConfig = this.generateConfigByApps(apps);
		return this.actualConfig;
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
		
		await this.generateConfig();
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
