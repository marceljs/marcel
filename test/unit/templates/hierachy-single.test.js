const tape = require('tape');
const hierarchy = require('../../../src/templates/hierarchy-single');

tape('single post hierarchy', test => {
	test.deepEqual(hierarchy({}), ['single', 'index'], 'empty object');

	test.deepEqual(
		hierarchy({
			section: 'posts'
		}),
		['single-posts', 'single', 'index'],
		'post with section'
	);

	test.deepEqual(
		hierarchy({
			section: 'posts',
			type: 'recipe'
		}),
		[
			'single-posts-recipe',
			'single-recipe',
			'single-posts',
			'single',
			'index'
		],
		'post with section and type'
	);

	test.end();
});
