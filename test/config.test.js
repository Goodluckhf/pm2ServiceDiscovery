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
	
	describe('equals', () => {
		it('Should return false if input object is null or not defined', () => {
			const config = Config.create(testTarget);
			expect(config.equals(null)).to.be.false;
		});
		
		it('Should return false if input object is not instance of Config', () => {
			const config = Config.create(testTarget);
			expect(config.equals({})).to.be.false;
		});
		
		it('Should return false if input config has empty targets', () => {
			const config      = Config.create(testTarget);
			const checkConfig = Config.create([]);
			expect(config.equals(checkConfig)).to.be.false;
		});
		
		it('Should return false if context config has empty targets', () => {
			const config      = Config.create([]);
			const checkConfig = Config.create(testTarget);
			expect(config.equals(checkConfig)).to.be.false;
		});
		
		it('Should return false if targets are not the same', () => {
			const config      = Config.create({ host: 'test2', port: 3333 });
			const checkConfig = Config.create(testTarget);
			expect(config.equals(checkConfig)).to.be.false;
		});
		
		it('Should return true if targets are the same', () => {
			const config      = Config.create(testTarget);
			const checkConfig = Config.create(testTarget);
			expect(config.equals(checkConfig)).to.be.true;
		});
	});
});
