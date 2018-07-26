export default (config) => {
	const servicesResponse = { [config.service_name]: [] };

	return (req, res) => {
		console.log(req.url);
		const { index } = req.query;
		if (!index) {
			res.json(servicesResponse);
			return;
		}
		
		setTimeout(() => {
			res.json(servicesResponse);
		}, config.polling_interval);
	};
};
