import { expect } from 'chai';
import Config     from '../src/Config';

describe('Config', () => {
	const testTarget = { host: 'test1', port: 3333 };
	
	it('Possible to create from list of targets', () => {
		const config = Config.create([testTarget]);
		expect(config.targets[0]).to.be.deep.equal(testTarget);
	});
	
	it('Possible to create from one target', () => {
		const config = Config.create(testTarget);
		expect(config.targets[0]).to.be.deep.equal(testTarget);
	});
	
	it('Possible to add target to exist config object', () => {
		const config = new Config();
		config.addTarget(testTarget);
		expect(config.targets[0]).to.be.deep.equal(testTarget);
	});
	
	it('Config object should be converted like consul API response for prometheus config', () => {
		const config = Config.create(testTarget);
		const expectedValue = [{
			ServiceAddress: testTarget.host,
			ServicePort   : testTarget.port,
		}];
		
		expect(config.getRawObject()).to.be.deep.equal(expectedValue);
	});
});
