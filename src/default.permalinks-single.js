module.exports = function(post, config) {
	return `/${post.directory}/${post.slug ||
		post.filename_slug ||
		post.title_slug}`;
};
