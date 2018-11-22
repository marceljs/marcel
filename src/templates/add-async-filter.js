module.exports = (renderer, name, func) => {
	renderer.addFilter(
		name,
		async function() {
			let args = Array.from(arguments);
			let callback = args.pop();
			try {
				callback(null, await func(...args));
			} catch (err) {
				callback(err);
			}
		},
		true // async
	);
};
