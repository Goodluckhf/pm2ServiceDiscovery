import { expect }          from 'chai';
import Pm2ServiceDiscovery from '../src/Pm2ServiceDiscovery';
import Config              from '../src/Config';

const logger = {
	info() {},
	error() {},
};

describe('Pm2ServiceDiscovery', () => {
	it('will leave value if name starts with value from config', () => {
		const pm2ServiceDiscovery = new Pm2ServiceDiscovery(logger, {}, {
			app_name_filter: 'strange__name_value',
		});
		
		const apps = pm2ServiceDiscovery.filterApps([{
			pm2_env: { status: 'online' },
			name   : 'strange__name_value-new-instance',
		}]);
		
		expect(apps).to.have.lengthOf(1);
	});
	
	it('will filter out value if name doesn\'t start with value from config', () => {
		const pm2ServiceDiscovery = new Pm2ServiceDiscovery(logger, {}, {
			app_name_filter: 'strange__name_value',
		});
		
		const apps = pm2ServiceDiscovery.filterApps([{
			pm2_env: { status: 'online' },
			name   : 'name_value-new-instance',
		}]);
		
		expect(apps).to.have.lengthOf(0);
	});
	
	it('will filter out value if status is not online', () => {
		const pm2ServiceDiscovery = new Pm2ServiceDiscovery(logger, {}, {
			app_name_filter: 'strange__name_value',
		});
		
		const apps = pm2ServiceDiscovery.filterApps([{
			pm2_env: { status: 'offline' },
			name   : 'strange__name_value-asd',
		}]);
		
		expect(apps).to.have.lengthOf(0);
	});
	
	it('Should generate config by apps', () => {
		const pm2ServiceDiscovery = new Pm2ServiceDiscovery(logger, {}, {
			app_name_filter: 'strange__name_value',
		});
		
		const config = pm2ServiceDiscovery.generateConfigByApps([{
			pm2_env: { status: 'offline' },
			name   : 'strange__name_value-asd',
		}]);
		
		expect(config).to.be.instanceOf(Config);
	});
});
