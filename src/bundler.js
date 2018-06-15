const config = require('./config');
const template_parser = require('./templates/parser');
const template_hierarchy = require('./templates/hierarchy');

class Bundler {
	constructor() {
		this.base = process.cwd();
		this.config = config(this);
		this.template_parser = template_parser(this);
	}

	render() {
		return this.template_parser.render(template_hierarchy()[0], { name: 'Dan' });
	}
}

module.exports = Bundler;
