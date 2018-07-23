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
	toString() {
		return JSON.stringify([{
			targets: this.targets,
		}]);
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
