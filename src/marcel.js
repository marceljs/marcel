// Libs
const fs = require('fs-extra');
const { join } = require('path');
const in_cwd = require('is-path-in-cwd');
const fg = require('fast-glob');
const vfile = require('to-vfile');

// Modules
const renderer = require('./templates/renderer');
const render_single = require('./templates/render-single');
const render_list = require('./templates/render-list');
const permalinks_list = require('./permalinks-list');

const markdown_parser = require('./pipeline/parse-md');

// Utils
const group_by = require('./util/group-by');
const add_async_filter = require('./templates/add-async-filter');
const from_entries = require('./util/from-entries');
const plugins_for = require('./util/plugins-for');

const read = require('./pipeline/read');

// Models
const List = require('./list');

const data_extensions = ['js', 'json', 'yaml', 'csv', 'tsv', 'ndtxt'];

const default_options = {
	// whether to include drafts in the build
	drafts: false
};

const noDrafts = post =>
	post.permalink !== false && (!post.draft || options.drafts);

module.exports = class Marcel {
	constructor(cfg) {
		this.config = cfg;
		this.site = {
			link: this.config.base
		};

		this.renderer = renderer(this.config);

		let fns = plugins_for(this.config, 'onload');
		this.renderer.on('load', (name, src) => {
			fns.forEach(f => f(name, src));
		});
	}

	async run(opts) {
		let options = {
			...default_options,
			...opts
		};

		// Load filters into Nunjucks
		Object.keys(this.config.filters).forEach(name =>
			add_async_filter(this.renderer, name, this.config.filters[name])
		);

		this.data = from_entries(
			(await Promise.all(
				(await read(
					`**/*.{${data_extensions.join(',')}}`,
					this.config.dataDir
				)).map(({ path, cwd }) =>
					vfile
						.read({ path, cwd }, 'utf8')
						.then(require('./pipeline/parse-data'))
				)
			)).map(f => [f.stem, f.data])
		);

		let parse = markdown_parser(this.config);

		let posts = (await Promise.all(
			(await read('**/*.md', this.config.contentDir)).map(
				({ path, cwd }) =>
					vfile
						.read({ path, cwd }, 'utf8')
						.then(require('./pipeline/file-stats'))
						.then(parse)
						.then(require('./pipeline/to-post')(this.config))
			)
		)).filter(noDrafts);

		let lists = this.config.lists.reduce((res, t) => {
			let groups = group_by(posts, t.from);

			function include_term(term) {
				return t.include_undefined || term !== '__undefined__';
			}

			let list_index = List({
				taxonomy: t.from,
				terms: groups
					.filter(item => include_term(item[0]) && item[1].length)
					.map(item => item[0])
			});

			return res
				.concat(
					t.include_index && list_index.terms.length
						? [list_index]
						: []
				)
				.concat(
					groups
						.map(item =>
							List({
								taxonomy: t.from,
								term: item[0],
								posts: item[1]
							})
						)
						.filter(
							l =>
								l.posts.length &&
								(t.include__undefined ||
									l.term !== '__undefined__')
						)
				);
		}, []);

		// Render the individual posts
		await Promise.all(
			posts.map(async post => {
				post.__rendered = await render_single(
					post,
					this.renderer,
					{
						site: this.site,
						data: this.data
					},
					this.config
				);
			})
		);

		// Render post lists

		let collections = (await Promise.all(
			lists.map(async list => {
				return {
					permalink: permalinks_list(list, this.config),
					__rendered: await render_list(
						list,
						this.renderer,
						{
							site: this.site,
							data: this.data
						},
						this.config
					)
				};
			})
		)).filter(c => c);

		if (!in_cwd(this.config.distDir)) {
			throw new Error(`
				---
				Configuration error!
				distDir: ${this.config.distDir} is outside the current working directory.
				To avoid deleting things accidentally due to misconfiguration,
				such a path is not currently supported, sorry.
				---
			`);
		}

		/*
			Clean up the `dist` dir
		 */
		await fs.emptyDir(this.config.distDir);

		// Copy the `static` folder over to `dist`
		if (fs.existsSync(this.config.staticDir)) {
			fs.copy(this.config.staticDir, this.config.distDir);
		}

		// Write collections and posts to disk
		collections
			.concat(posts)
			.forEach(entry =>
				this.write_page(entry.permalink, entry.__rendered)
			);

		plugins_for(this.config, 'onfinish').forEach(f => f());
	}

	async write_page(permalink, content) {
		/*
			If the permalink ends in '.html',
			don't append the '/index.html' part.

			This lets us write files like 404.html on the disk.
		 */
		let output_path = permalink.match(/\.html$/)
			? permalink
			: join(permalink, 'index.html');
		fs.outputFileSync(join(this.config.distDir, output_path), content);
	}
};
