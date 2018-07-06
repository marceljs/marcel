module.exports = function(post) {
	return `/${post.directory}/${post.slug || post.filename_slug || post.title_slug}`;
};
