/*
	Load Marcel configuration file
 */

const fs = require('fs');
const path = require('path');

const DEFAULT_CONFIG_FILE_PATH = 'marcel.config.js';

module.exports = bundler => {
	const config_path = path.join(bundler.base, DEFAULT_CONFIG_FILE_PATH);
	return require(config_path);
};
