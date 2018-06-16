const config = require('./config');
const template_parser = require('./templates/parser');
const hierarchy = require('./templates/hierarchy');
const markdown_processor = require('./content/markdown');

const fs = require('fs');
const fg = require('fast-glob');
const path = require('path');

const find_template = (templates, base) =>
	templates.find(template => {
		const template_path = path.join(base, template);
		console.log(template_path);
		return fs.existsSync(template_path);
	});

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
					return this.render(post, this.config);
				})
				.forEach(res => console.log(res));
		});
	}

	render(post, config) {
		let templates = hierarchy.single(post, config.templateExt);
		let template = find_template(templates, config.templateDir);
		if (template) {
			return this.template_parser.render(template, { post });
		} else {
			throw new Error('Could not find a matching template');
		}
	}
}

module.exports = Bundler;
