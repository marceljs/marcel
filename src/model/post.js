const { stat, exists, readFile } = require('fs-extra');
const { resolve, join, sep } = require('path');
const { parse } = require('url');
const { promisify } = require('util');
const vfile = require('to-vfile');
const slugify = require('@sindresorhus/slugify');
const visit = require('unist-util-visit');

const strip_filename_prefix = require('../util/strip-filename-prefix');

/*
	A map of all content files, useful for
	resolving relative links in markdown files
	to their appropriate permalink.
 */
const __posts__ = new Map();

class Post {
	/*
		Load a file path into a VFile,
		and augment its data with:
		* frontmatter defined in an external file
		* file statistics (creation date, etc.)
	 */
	async load(path, { cwd, frontmatter_path }) {
		let file = await vfile.read({ path, cwd }, 'utf8');

		file.data.frontmatter = {};

		// Load frontmatter from external file
		let fm_path = resolve(cwd, frontmatter_path);
		if (await exists(fm_path)) {
			file.data.frontmatter = JSON.parse(await readFile(fm_path, 'utf8'));
		}

		// Load file stats
		let stats = await stat(resolve(file.cwd, file.path));
		file.data.stats = {
			date: new Date(stats.birthtimeMs),
			updated: new Date(stats.mtimeMs)
		};

		this.file = file;

		__posts__.set(this.file.path, this);
	}

	async execute(renderer, context) {
		if (!this.file) {
			throw new Error('File has not been loaded');
		}
		let render = promisify(renderer.renderString.bind(renderer));
		this.file.contents = await render(this.file.contents, context);
	}

	async parse(parser) {
		if (!this.file) {
			throw new Error('File has not been loaded');
		}
		this.file.__ast__ = await parser(this.file);
	}

	async transform(transformer) {
		if (!this.file.__ast__) {
			throw new Error('File has not been parsed');
		}
		this.file.__ast__ = await transformer(this.file.__ast__, this.file);
	}

	async compile(compiler) {
		if (!this.file.__ast__) {
			throw new Error('File has not been parsed');
		}
		this.file.contents = await compiler(this.file.__ast__, this.file);
	}

	apply_permalinks() {
		if (!this.file.__ast__) {
			throw new Error('File has not been parsed');
		}

		visit(this.file.__ast__, node => {
			if (node.tagName === 'a') {
				let { href } = node.properties;

				/*
					Note: The WHATWG-compliant URL parser
					that's invoked with new URL() can't currently
					handle relative URLs, and it's hard to solve
					this comprehensively. For now, we rely on
					url.parse(), with the caveat that it may be
					deprecated in the future.
					See: https://github.com/nodejs/node/issues/12682
				 */
				let url = parse(href);
				if (url.protocol === null && url.pathname) {
					let link = join(this.file.dirname, url.pathname);
					if (__posts__.has(link)) {
						let destination = __posts__.get(link);
						let { permalink } = destination;
						if (url.query) {
							permalink += '?' + url.query;
						}
						if (url.hash) {
							permalink += url.hash;
						}
						node.properties.href = permalink;
					}
				}
			}
		});
	}

	/*
		Property getters
		----------------
	 */

	get stats() {
		return this.file.data.stats;
	}

	get frontmatter() {
		return this.file.data.frontmatter;
	}

	get title() {
		return this.frontmatter.title;
	}

	get excerpt() {
		return this.frontmatter.excerpt;
	}

	get content() {
		return this.file.contents;
	}

	get date() {
		return this.frontmatter.date || this.stats.date;
	}

	get updated() {
		return this.frontmatter.updated || this.stats.updated;
	}

	get section() {
		let section = this.file.dirname.split(sep)[0];
		return section === '.' ? '__undefined__' : section;
	}

	get slug() {
		return this.frontmatter.slug;
	}

	get title_slug() {
		if (this.frontmatter.title) {
			return slugify(this.frontmatter.title);
		}
		return undefined;
	}

	get filename_slug() {
		return (
			slugify(strip_filename_prefix(this.file.stem)) ||
			slugify(this.file.stem)
		);
	}

	get permalink() {
		// Explicit permalink in front matter
		if (this.frontmatter.permalink !== undefined) {
			return this.frontmatter.permalink;
		}

		// User-supplied permalink.
		// Allow a result of `false` to be returned (= is draft),
		// only go to default on undefined.
		let custom = Post.Permalink ? Post.Permalink(this) : undefined;
		return custom !== undefined ? custom : Post.DefaultPermalink(this);
	}

	get draft() {
		return this.frontmatter.draft;
	}

	get templates() {
		return Post.Hierarchy(this);
	}
}

/*
	Static properties
	-----------------
 */

Post.Permalink = null;
Post.DefaultPermalink = post => {
	let link = post.slug || post.filename_slug || post.title_slug;
	return post.file.dirname === '.'
		? `/${link}`
		: `/${post.file.dirname}/${link}`;
};

Post.Hierarchy = post => {
	let templates = [];

	if (post.template) {
		templates.push(post.template);
	}

	if (post.type) {
		if (post.section && post.section !== '__undefined__') {
			templates.push(`single-${post.section}-${post.type}`);
		}
		templates.push(`single-${post.type}`);
	}

	if (post.section && post.section !== '__undefined__') {
		templates.push(`single-${post.section}`);
	}

	return templates.concat([`single`, `index`]);
};

module.exports = Post;
