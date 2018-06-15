const config = require('./config');
const template_parser = require('./templates/parser');
const template_hierarchy = require('./templates/hierarchy');
const markdown_processor = require('./content/markdown');

const fs = require('fs');
const fg = require('fast-glob');

class Bundler {
	constructor() {
		this.base = process.cwd();
		this.config = config(this);
		this.template_parser = template_parser(this);
		Promise.all(
			fg.sync([`${this.config.contentDir}/**/*.md`]).map(entry => markdown_processor(entry))
		).then(entries => {
			entries
				.map(post => {
					return this.render(post);
				})
				.forEach(res => console.log(res));
		});
	}

	render(post) {
		return this.template_parser.render(template_hierarchy()[0], { post });
	}
}

module.exports = Bundler;
