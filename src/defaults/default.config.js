module.exports = {
	contentDir: 'content',
	dataDir: 'data',
	templateDir: 'templates',
	staticDir: 'static',
	distDir: 'dist',
	filterDir: 'filters',
	base: '/',
	templateExt: 'html',
	lists: [
		{
			from: 'section',
			include_undefined: false
		},
		{
			from: 'tags',
			default_value: 'untagged',
			include_undefined: false
		}
	],
	permalinks: {
		// see the default permalink scheme in src/defaults/default.permalinks-single.js
		single: (post, site) => false,

		// see the default permalink scheme in src/defaults/default.permalinks-list.js
		list: (list, site) => false
	}
};
