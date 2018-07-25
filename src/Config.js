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
	 * @param {string} target
	 * @returns {Config}
	 */
	addTarget(target) {
		this.targets.push(target);
		return this;
	}
	
	/**
	 * @returns {string}
	 */
	toJson() {
		const result = this.targets.map((target) => {
			console.log(target);
			const splited = target.split(':');
			return {
				ServiceAddress: splited[0],
				ServicePort   : parseInt(splited[1], 10),
			};
		});
		
		return result;
	}
	
	/**
	 * @param {Array|string} opts
	 * @returns {Config}
	 */
	static create(opts) {
		return new this(opts);
	}
}

export default Config;
