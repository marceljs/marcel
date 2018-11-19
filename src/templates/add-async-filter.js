module.exports = (renderer, filter) => {
	renderer.addFilter(
		filter.name,
		async function() {
			let args = Array.from(arguments);
			let callback = args.pop();
			try {
				let res = await filter.func(...args);
				callback(null, res);
			} catch (err) {
				callback(err);
			}
		},
		true
	);
};
