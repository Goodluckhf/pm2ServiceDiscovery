export default (config, serviceDiscovery) => {
	let oldConfig = null;
	
	return async (req, res) => {
		console.log(req.url);
		const actualConfig = serviceDiscovery.getActualConfig();
		
		// Если модуль только стартанул,
		// надо сразу сгенерировать и отдать конфиг
		if (!actualConfig) {
			const generatedConfig = await serviceDiscovery.generateConfig();
			res.json(generatedConfig.getRawObject());
			return;
		}
		
		// Если индекса нет
		// Значит запроси пришел либо в ручную
		// Либо это первый запрос
		const { index } = req.query;
		if (!index) {
			res.json(actualConfig.getRawObject());
			return;
		}
		
		// Сам long polling
		// По таймауту, если конфиг не изменился
		// Отдаем текущий актуальный
		let responseSent = false;
		let interval     = null;
		const timeout = setTimeout(() => {
			clearInterval(interval);
			if (responseSent) {
				return;
			}
			
			responseSent = true;
			res.json(actualConfig.getRawObject());
		}, config.polling_interval);
		
		interval = setInterval(() => {
			const actualConfigForIteration = serviceDiscovery.getActualConfig();
			if (actualConfigForIteration.equals(oldConfig)) {
				return;
			}
			
			clearTimeout(timeout);
			clearInterval(interval);
			oldConfig = actualConfigForIteration;
			const newConfig = serviceDiscovery.getActualConfig();
			res.json(newConfig.getRawObject());
		}, 1000);
	};
};
