module.exports = {
	contentDir: 'content',
	dataDir: 'data',
	templateDir: 'templates',
	staticDir: 'static',
	distDir: 'dist',
	base: '/',
	templateExt: 'html',
	permalinks: {
		// see the default permalink scheme in src/defaults/default.permalinks-single.js
		single: (post, site) => false,

		// see the default permalink scheme in src/defaults/default.permalinks-list.js
		list: (list, site) => false
	}
};
