module.exports = {
	contentDir: 'content',
	dataDir: 'data',
	templateDir: 'templates',
	staticDir: 'static',
	distDir: 'dist',
	filters: {
		format_date: require('./filters/format_date'),
		sort_by: require('./filters/sort_by')
	},
	base: '/',
	templateExt: 'html',
	lists: [
		{
			from: 'section',
			include_index: false,
			include_undefined: false
		},
		{
			from: 'tags',
			default_value: 'untagged',
			include_index: true,
			include_undefined: false
		}
	],
	permalinks: {
		// see the default permalink scheme in src/default.permalinks-single.js
		single: (post, site) => false,

		// see the default permalink scheme in src/default.permalinks-list.js
		list: (list, site) => false
	}
};
