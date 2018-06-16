// Libs
const fs = require('fs-extra');
const path = require('path');
const inCwd = require('is-path-in-cwd');

// Modules
const config = require('./config');
const renderer = require('./templates/renderer');
const render_single = require('./templates/render-single');
const render_list = require('./templates/render-list');
const error_dist_dir = require('./errors/dist-dir');
const permalinks_single = require('./permalinks/single');
const permalinks_list = require('./permalinks/list');
const read_data_files = require('./data/read');
const read_content_files = require('./content/read');
const group_by = require('./util/group-by');

// Models
const Post = require('./models/post');

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

		posts = posts.map(post => new Post(post));

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
			let html = render_single(this.renderer, context, this.config);
			let permalink = permalinks_single(post, this.config);
			this.write_page(permalink, html);
		});

		// Render, and write to disk, post lists
		let sections = group_by(posts, post => post.section);

		Object.keys(sections).forEach(section => {
			let context = {
				posts: sections[section],
				site: this.site,
				data: this.data
			};
			let html = render_list(this.renderer, context, this.config);
			let permalink = permalinks_list(section, this.config);
			this.write_page(permalink, html);
		});
	}

	async write_page(permalink, content) {
		fs.outputFile(path.join(this.config.distDir, permalink, 'index.html'), content);
	}
}

module.exports = Bundler;
