const config = require('./config');
const template_parser = require('./templates/parser');
const hierarchy_single = require('./templates/hierarchy-single');
const hierarchy_list = require('./templates/hierarchy-list');
const markdown_processor = require('./content/markdown');
const error_dist_dir = require('./errors/dist-dir');

const permalinks_single = require('./permalinks/single');
const permalinks_list = require('./permalinks/list');

const fs = require('fs-extra');
const fg = require('fast-glob');
const path = require('path');

const load_data = require('./data/load');

const inCwd = require('is-path-in-cwd');

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
		load_data(fg.sync(['**/*.*'], { cwd: this.config.dataDir }), this.config.dataDir).then(
			data_entries => {
				this.data = {};

				data_entries.forEach(entry => (this.data[entry.name] = entry.result));

				Promise.all(
					fg
						.sync([`**/*.md`], { cwd: this.config.contentDir })
						.map(entry => markdown_processor(entry, this.config.contentDir))
				).then(async entries => {
					if (!inCwd(this.config.distDir)) {
						throw Error(error_dist_dir(this.config.distDir));
					}

					await fs.emptyDir(this.config.distDir);
					// Copy the `static` folder over to `dist`
					fs.copy(this.config.staticDir, this.config.distDir);

					// Build the individual posts
					entries
						.map(post => {
							return {
								post,
								rendered: this.render(post, this.site, this.data, this.config)
							};
						})
						.forEach(res => {
							let permalink = permalinks_single(res.post, this.config);
							fs.outputFile(
								`${this.config.distDir}/${permalink}/index.html`,
								res.rendered
							);
						});
				});
			}
		);
	}

	render(post, site, data, config) {
		let templates = hierarchy_single(post, config.templateExt);
		let template = find_template(templates, config.templateDir);
		if (template) {
			let context = {
				post,
				site,
				data
			};
			return this.template_parser.render(template, context);
		} else {
			throw new Error('Could not find a matching template');
		}
	}
}

module.exports = Bundler;
