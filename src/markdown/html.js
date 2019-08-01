const unified = require('unified');

let processor = unified().use(require('rehype-stringify'));

module.exports = processor.stringify;
