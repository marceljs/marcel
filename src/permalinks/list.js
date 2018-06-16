const default_scheme = require('../defaults/default.permalinks-list.js');

module.exports = function(list, config) {
	return config.permalinks.list(list) || default_scheme(list);
};
