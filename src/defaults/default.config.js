module.exports = {
	contentDir: 'content',
	dataDir: 'data',
	templateDir: 'templates',
	staticDir: 'static',
	distDir: 'dist',
	base: '/',
	templateExt: 'html',
	permalinks: {
		single: function(post, site) {
			return `${post.slug || post.filename_slug || post.title_slug}`;
		},
		list: function(list, site) {
			return ``;
		}
	}
};
