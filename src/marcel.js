// Libs
const fs = require('fs-extra');
const { join } = require('path');
const in_cwd = require('is-path-in-cwd');
const fg = require('fast-glob');
const vfile = require('to-vfile');
const visit = require('unist-util-visit');

// Modules
const renderer = require('./templates/renderer');
const render_single = require('./templates/render-single');
const render_list = require('./templates/render-list');

const mdast_proc = require('./markdown/mdast');
const hast_proc = require('./markdown/hast');
const html_proc = require('./markdown/html');

// Utils
const group_by = require('./util/group-by');
const add_async_filter = require('./templates/add-async-filter');
const plugins_for = require('./util/plugins-for');

// Models
const Post = require('./model/post');
const List = require('./model/list');

const default_options = {
	// whether to include drafts in the build
	drafts: false
};

module.exports = class Marcel {
	constructor(cfg) {
		this.site = {
			base: cfg.base
		};

		// Configure Models
		Post.Permalink = post => cfg.permalinks.single(post, cfg);
		List.Permalink = list => cfg.permalinks.list(list, cfg);

		this.renderer = renderer(cfg);

		let fns = plugins_for(cfg, 'onload');
		this.renderer.on('load', (name, src) => {
			fns.forEach(f => f(name, src));
		});

		this.config = cfg;
	}

	async run(opts) {
		let options = {
			...default_options,
			...opts
		};

		let { dataDir, contentDir } = this.config;

		// Load filters into Nunjucks
		Object.keys(this.config.filters).forEach(name =>
			add_async_filter(this.renderer, name, this.config.filters[name])
		);

		/*
			Load global data
			----------------
		 */

		let data_paths = await fg('**/*.{js,json,yaml,csv,tsv,ndtxt}', {
			cwd: dataDir
		});

		let data_files = await Promise.all(
			data_paths.map(path =>
				vfile
					.read({ path, cwd: dataDir }, 'utf8')
					.then(require('./pipeline/parse-data'))
			)
		);

		this.data = Object.fromEntries(data_files.map(f => [f.stem, f.data]));

		/*
			Load content files
			------------------
		 */

		let content_paths = await fg('**/*.md', { cwd: contentDir });
		let adjacent_fm = path => path.replace(/\.md$/, '.json');

		let mdast = mdast_proc(this.config.markdown);
		let hast = hast_proc(this.config.markdown);
		let html = html_proc(this.config.markdown);

		let posts = await Promise.all(
			content_paths.map(async path => {
				let post = new Post();
				await post.load(path, {
					cwd: contentDir,
					frontmatter_path: adjacent_fm(path)
				});
				await post.parse(mdast);
				return post;
			})
		);

		posts = posts.filter(
			({ permalink, draft }) =>
				permalink !== false && (!draft || options.drafts)
		);

		posts = await Promise.all(
			posts.map(async post => {
				await post.transform(hast);
				return post;
			})
		);

		posts.forEach(post => post.apply_permalinks());

		posts = await Promise.all(
			posts.map(async post => {
				await post.compile(html);
				return post;
			})
		);

		/*
			Generate lists
			--------------
		 */

		let lists = this.config.lists.reduce((res, t) => {
			let groups = group_by(posts, t.from);

			function include_term(term) {
				return t.include_undefined || term !== '__undefined__';
			}

			let list_index = new List({
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
						.map(
							item =>
								new List({
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
					permalink: list.permalink,
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
