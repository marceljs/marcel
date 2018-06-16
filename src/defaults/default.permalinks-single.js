module.exports = function(post, site) {
	return `${post.directory}/${post.slug || post.filename_slug || post.title_slug}`;
};
