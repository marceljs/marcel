const default_scheme = require('../defaults/default.permalinks-single.js');

module.exports = function(post, config) {
	return (
		config.permalinks.single(post, config) || default_scheme(post, config)
	);
};
