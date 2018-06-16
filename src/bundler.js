// Libs
const fs = require('fs-extra');
const path = require('path');
const inCwd = require('is-path-in-cwd');

// Modules
const config = require('./config');
const renderer = require('./templates/renderer');
const render_single = require('./templates/render-single');
const error_dist_dir = require('./errors/dist-dir');
const permalinks_single = require('./permalinks/single');
const permalinks_list = require('./permalinks/list');
const read_data_files = require('./data/read');
const read_content_files = require('./content/read');

class Bundler {
	constructor() {
		this.base = process.cwd();
		this.config = config(this);
		this.site = {
			link: this.config.base
		};

		this.renderer = renderer(this.config);

		this.run();
	}

	async run() {
		let data_files = await read_data_files(this.config.dataDir);

		// populate this.data with the content of the data files.
		let data = {};
		data_files.forEach(f => (data[f.stem] = f.data));
		this.data = data;

		let posts = await read_content_files(this.config.contentDir);

		if (!inCwd(this.config.distDir)) {
			throw Error(error_dist_dir(this.config.distDir));
		}

		await fs.emptyDir(this.config.distDir);

		// Copy the `static` folder over to `dist`
		fs.copy(this.config.staticDir, this.config.distDir);

		// Render, and write to disk, the individual posts
		posts.forEach(post => {
			let context = {
				post,
				site: this.site,
				data: this.data
			};
			post.__rendered_html = render_single(this.renderer, context, this.config);
			let permalink = permalinks_single(post, this.config);
			fs.outputFile(`${this.config.distDir}/${permalink}/index.html`, post.__rendered_html);
		});
	}
}

module.exports = Bundler;
