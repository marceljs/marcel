const config = require('./config');
const template_parser = require('./templates/parser');
const hierarchy = require('./templates/hierarchy');
const markdown_processor = require('./content/markdown');

const fs = require('fs-extra');
const fg = require('fast-glob');
const path = require('path');

const find_template = (templates, base) =>
	templates.find(template => {
		const template_path = path.join(base, template);
		return fs.existsSync(template_path);
	});

const create_site = config => ({
	link: config.base,
	permalinks: config.permalinks
});

class Bundler {
	constructor() {
		this.base = process.cwd();
		this.config = config(this);
		this.template_parser = template_parser(this);
		this.site = create_site(this.config);

		Promise.all(
			fg.sync([`${this.config.contentDir}/**/*.md`]).map(entry => markdown_processor(entry))
		).then(entries => {
			// Copy the `static` folder over to `dist`
			fs.copy(this.config.staticDir, this.config.distDir);

			// Build the individual posts
			entries
				.map(post => {
					return {
						post,
						rendered: this.render(post, this.site, this.config)
					};
				})
				.forEach(res => {
					let permalink = this.config.permalinks.single(res.post);
					fs.outputFile(`${this.config.distDir}/${permalink}/index.html`, res.rendered);
				});
		});
	}

	render(post, site, config) {
		let templates = hierarchy.single(post, config.templateExt);
		let template = find_template(templates, config.templateDir);
		if (template) {
			let context = {
				post,
				site
			};
			return this.template_parser.render(template, context);
		} else {
			throw new Error('Could not find a matching template');
		}
	}
}

module.exports = Bundler;
