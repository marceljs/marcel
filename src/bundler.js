const config = require('./config');

class Bundler {
	constructor() {
		this.base = process.cwd();
		this.config = config(this);
	}
}

module.exports = Bundler;
