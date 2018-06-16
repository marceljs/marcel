const slugify = require('@sindresorhus/slugify');
const nodePath = require('path');

class Post {
	constructor({ content, data, path, site }) {
		// copy data over to the object
		// TODO make sure none of the data overwrites any property or method
		Object.assign(this, data);

		// ...and also make it available in .data
		this.data = data;

		// Populate content
		this.content = content;

		if (this.title) {
			this.title_slug = slugify(this.title);
		}

		this.path = path;

		this.filename = nodePath.basename(path, nodePath.extname(path)).replace(/^\d+\-+/, '');
		this.filename_slug = slugify(this.filename);

		// this.permalink =
	}
}

module.exports = Post;
