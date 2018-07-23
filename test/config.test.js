import { expect } from 'chai';
import Config     from '../src/Config';

describe('Config', () => {
	it('Possible to create from list of targets', () => {
		const targetsList = ['test1'];
		const config = Config.create(targetsList);
		expect(config.targets[0]).to.be.equal(targetsList[0]);
	});
	
	it('Possible to create from one target', () => {
		const target = 'newTarget';
		const config = Config.create(target);
		expect(config.targets[0]).to.be.equal(target);
	});
	
	it('Possible to add target to exist config object', () => {
		const newTarget = 'testTarget';
		const config = new Config();
		config.addTarget(newTarget);
		expect(config.targets[0]).to.be.equal(newTarget);
	});
	
	it('Config object should be converted to string for prometheus config', () => {
		const newTarget = 'testTarget';
		const config = Config.create(newTarget);
		const expectedValue = JSON.stringify([{ targets: [newTarget] }]);
		expect(config.toJson()).to.be.equal(expectedValue);
	});
});
