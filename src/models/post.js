const slugify = require('@sindresorhus/slugify');
const nodePath = require('path');

const strip_filename_prefix = require('../util/strip-filename-prefix');

class Post {
	constructor({ data, content, file }) {
		/*
			Copy over:
			1. file stats (.date, .updated)

			2. front-matter data 
			(Might overwrite file stats; this is intentional)
		 */
		Object.assign(this, file.stats, data);

		// Also make them available separately
		this.data = data;
		this.stats = file.stats;

		// Populate content
		if (this.content) {
			console.warn(`
				Found .content property in front-matter. 
				It will be overwritten with the post's content.
				You can read the front-matter value from: post.data.content
			`);
		}
		this.content = content;

		if (this.title) {
			this.title_slug = slugify(this.title);
		}

		this.path = file.path;
		this.directory = file.dirname;
		this.filename = file.stem;
		this.filename_slug =
			slugify(strip_filename_prefix(this.filename)) ||
			slugify(this.filename);

		this.section = this.directory.split(nodePath.sep)[0];
		if (this.section === '.') {
			this.section = '__undefined__';
		}
	}
}

module.exports = Post;
