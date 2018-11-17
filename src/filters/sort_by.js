const getPath = (o, path) =>
	path
		.split('.')
		.reduce((res, prop) => (res !== undefined ? res[prop] : undefined), o);

module.exports = function(collection, propPath) {
	return collection
		.slice()
		.sort((a, b) => getPath(a, propPath) - getPath(b, propPath));
};
