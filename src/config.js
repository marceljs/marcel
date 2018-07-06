/*
	Load Marcel configuration file
 */

const fs = require('fs');
const path = require('path');
const deepmerge = require('deepmerge');

const default_config = require('./defaults/default.config.js');

const CONFIG_FILE_DEFAULT_PATH = 'marcel.config.js';

module.exports = bundler => {
	if (fs.existsSync(CONFIG_FILE_DEFAULT_PATH)) {
		return deepmerge(
			default_config,
			require(path.join(process.cwd(), CONFIG_FILE_DEFAULT_PATH))
		);
	} else {
		return default_config;
	}
};
