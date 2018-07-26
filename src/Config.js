class Config {
	constructor(targets = []) {
		this.targets = [];
		
		if (!Array.isArray(targets)) {
			return this.addTarget(targets);
		}
		
		targets.forEach((target) => {
			this.addTarget(target);
		});
	}
	
	/**
	 * @param {{}} target
	 * @returns {Config}
	 */
	addTarget({ host, port }) {
		this.targets.push({
			host,
			port,
		});
		return this;
	}
	
	/**
	 * @returns {{}}
	 */
	getRawObject() {
		return this.targets.map(({ host, port }) => {
			return {
				ServiceAddress: host,
				ServicePort   : port,
			};
		});
	}
	
	/**
	 *
	 * @param {Config} config
	 * @return {boolean}
	 */
	equals(config) {
		if (!config) {
			return false;
		}
		
		if (!this.targets.length && config.targets.length) {
			return false;
		}
		
		if (!config.targets.length && this.targets.length) {
			return false;
		}
		
		return this.targets.every((thisTarget) => {
			return config.targets.some((configTarget) => {
				return thisTarget.host === configTarget.host
					&& thisTarget.port === configTarget.port;
			});
		});
	}
	
	/**
	 * @param {Array<{}>|{}} opts
	 * @returns {Config}
	 */
	static create(opts) {
		return new this(opts);
	}
}

export default Config;
