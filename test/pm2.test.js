import pm2      from 'pm2';
import bluebird from 'bluebird';
import sinon    from 'sinon';
import sinonChai from 'sinon-chai';
import chai     from 'chai';
import chaiAsPromised from 'chai-as-promised';

import Pm2ServiceDiscovery from '../src/Pm2ServiceDiscovery';

const logger = {
	info() {},
	error() {},
};

//@TODO: Сделать через конфиг
// Пока так
const pm2ServiceDiscovery = new Pm2ServiceDiscovery(logger, pm2, {
	events: ['start', 'restart', 'exit'],
});

chai.use(chaiAsPromised);
chai.use(sinonChai);
const { expect } = chai;

bluebird.promisifyAll(pm2);

const appName = 'TEST';
describe('Pm2 events', () => {
	before(async () => {
		await pm2.connectAsync();
	});
	
	describe('Should start generate config', function () {
		this.timeout(10000);
		
		beforeEach(async () => {
			this.sandbox = sinon.createSandbox();
			this.generateConfigStub = this.sandbox.stub(pm2ServiceDiscovery, 'generateConfigByApps').resolves(true);
			
			await pm2.startAsync({
				name  : appName,
				script: 'pm2TestScript.js',
				cwd   : './test/',
				watch : false,
			});
			await pm2.stopAsync(appName);
			await pm2ServiceDiscovery.startListen();
		});
		
		
		afterEach(async () => {
			this.sandbox.restore();
			pm2ServiceDiscovery.stopListen();
			const apps = await pm2.describeAsync(appName);
			if (!apps.length) {
				return;
			}
			
			await pm2.deleteAsync(appName);
		});
		
		it('if exec "pm2 start"', async () => {
			await pm2.startAsync(appName);
			await bluebird.delay(50);
			expect(this.generateConfigStub).to.have.been.called;
		});
		
		
		it('if exec "pm2 stop"', async () => {
			await pm2.startAsync(appName);
			this.generateConfigStub.resetHistory();
			await pm2.stopAsync(appName);
			await bluebird.delay(50);
			expect(this.generateConfigStub).to.have.been.called;
		});
		
		it('if exec "pm2 scale to more instances"', async () => {
			await pm2.scaleAsync(appName, 3);
			await bluebird.delay(50);
			expect(this.generateConfigStub).to.have.been.called;
		});
		
		it('if exec "pm2 scale to less instances"', async () => {
			await pm2.scaleAsync(appName, 3);
			this.generateConfigStub.resetHistory();
			await pm2.scaleAsync(appName, 1);
			await bluebird.delay(50);
			expect(this.generateConfigStub).to.have.been.called;
		});
		
		it('if exec "pm2 delete"', async () => {
			await pm2.startAsync(appName);
			this.generateConfigStub.resetHistory();
			await pm2.deleteAsync(appName);
			await bluebird.delay(50);
			expect(this.generateConfigStub).to.have.been.called;
		});
		
		it('if exec "pm2 restart"', async () => {
			await pm2.restartAsync(appName);
			await bluebird.delay(50);
			expect(this.generateConfigStub).to.have.been.called;
		});
		
		it('if exec "pm2 reload"', async () => {
			await pm2.restartAsync(appName);
			await bluebird.delay(50);
			expect(this.generateConfigStub).to.have.been.called;
		});
	});
	
	after(async () => {
		await pm2.disconnectAsync();
	});
});
