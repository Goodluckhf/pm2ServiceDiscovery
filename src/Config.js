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
	 * @param {Array<{}>|{}} opts
	 * @returns {Config}
	 */
	static create(opts) {
		return new this(opts);
	}
}

export default Config;
