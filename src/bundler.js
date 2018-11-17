// Libs
const fs = require('fs-extra');
const path = require('path');
const inCwd = require('is-path-in-cwd');
const fg = require('fast-glob');

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
const add_async_filter = require('./util/add-async-filter');

// Models
const Post = require('./models/post');

class Bundler {
	constructor(cfg) {
		this.config = cfg;
		this.site = {
			link: this.config.base
		};

		this.renderer = renderer(this.config);
	}

	async run() {
		/* 
			Load filters
			------------
		*/

		let default_filters = await fg('*.js', {
			cwd: path.resolve(__dirname, 'filters')
		}).then(filepaths =>
			filepaths.map(filepath => ({
				name: filepath.replace(/\.js$/, ''),
				func: require(`./filters/${filepath}`)
			}))
		);

		let custom_filters = await fg('*.js', {
			cwd: this.config.filterDir
		}).then(filepaths =>
			filepaths.map(filepath => ({
				name: filepath.replace(/\.js$/, ''),
				func: require(path.resolve(
					process.cwd(),
					this.config.filterDir,
					filepath
				))
			}))
		);

		default_filters
			.concat(custom_filters)
			.map(f => add_async_filter(this.renderer, f));

		let data_files = await read_data_files(this.config.dataDir);

		// populate this.data with the content of the data files.
		let data = {};
		data_files.forEach(f => (data[f.stem] = f.data));
		this.data = data;

		let posts = await read_content_files(this.config.contentDir);

		posts = posts.map(post => new Post(post));

		// Add in the permalinks for the posts.
		// TODO this weird way of doing it will probably
		// need a refactor at some point.
		// Re: https://github.com/marceljs/marcel/issues/39
		posts.forEach(post => {
			if (!post.permalink) {
				post.permalink = permalinks_single(post, this.config);
			}
		});

		if (!inCwd(this.config.distDir)) {
			throw Error(error_dist_dir(this.config.distDir));
		}

		await fs.emptyDir(this.config.distDir);

		// Copy the `static` folder over to `dist`
		if (fs.existsSync(this.config.staticDir)) {
			fs.copy(this.config.staticDir, this.config.distDir);
		}

		// Render, and write to disk, the individual posts

		await Promise.all(
			posts.map(async post => {
				let context = {
					post,
					site: this.site,
					data: this.data
				};
				let html = await render_single(
					this.renderer,
					context,
					this.config
				);
				this.write_page(post.permalink, html);
			})
		);

		// Render, and write to disk, post lists
		let sections = group_by(posts, post => post.section);

		await Promise.all(
			Object.keys(sections).map(async section => {
				if (section === 'default') {
					// don't render the default section list
					return;
				}
				let context = {
					posts: sections[section].sort((a, b) => a.date - b.date),
					site: this.site,
					data: this.data
				};
				let html = await render_list(
					this.renderer,
					context,
					this.config
				);
				let permalink = permalinks_list(section, this.config);
				this.write_page(permalink, html);
			})
		);
	}

	async write_page(permalink, content) {
		/*
			If the permalink ends in '.html',
			don't append the '/index.html' part.

			This lets us write files like 404.html on the disk.
		 */
		let output_path = permalink.match(/\.html$/)
			? permalink
			: path.join(permalink, 'index.html');
		fs.outputFile(path.join(this.config.distDir, output_path), content);
	}
}

module.exports = Bundler;
