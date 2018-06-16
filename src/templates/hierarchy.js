/*
	Template hierarchy
 */

const single_taxonomy = (type, layout) => [
	`single-${type}-${layout}.html`,
	`single-${type}.html`,
	`single.html`
];

module.exports = (bundler, asset) => {
	return ['index.html']; // todo add hierarchy
};
