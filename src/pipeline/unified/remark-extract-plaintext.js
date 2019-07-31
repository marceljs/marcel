const unified = require('unified');
const strip = require('strip-markdown');
const stringify = require('remark-stringify');
const extend = require('extend');
/*
	Unified plugin that adds the `plaintext` property
	to the file's `data`.
 */
module.exports = () => {
	let processor = unified()
		.use(strip)
		.use(stringify);
	return (ast, file) => {
		file.data.plaintext = processor
			.stringify(processor.runSync(extend(true, {}, ast)))
			// Trim any newlines at the beginning/end of the text.
			.replace(/^\n*|\n*$/, '');
	};
};
