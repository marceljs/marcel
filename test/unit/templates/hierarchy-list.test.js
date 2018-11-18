const tape = require('tape');
const hierarchy = require('../../../src/templates/hierarchy-list');

tape('single post hierarchy', test => {
	test.deepEqual(hierarchy({}), ['list', 'index'], 'empty object');

	test.deepEqual(
		hierarchy({
			taxonomy: 'tags'
		}),
		['list-tags-index', 'list-tags', 'list', 'index'],
		'tags index'
	);

	test.deepEqual(
		hierarchy({
			taxonomy: 'tags',
			term: 'myterm'
		}),
		['list-tags-myterm', 'list-tags', 'list', 'index'],
		'tags term page'
	);

	test.deepEqual(
		hierarchy({
			taxonomy: 'section',
			term: 'posts'
		}),
		['list-posts', 'list', 'index'],
		'section list'
	);

	test.end();
});
