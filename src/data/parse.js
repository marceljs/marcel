const yaml = require('js-yaml');
const { csvParse, tsvParse } = require('d3-dsv');
const path = require('path');

/*
	From here: https://github.com/d3/d3-dsv

	Byte-Order Marks
	----------------
	DSV files sometimes begin with a byte order mark (BOM); 
	saving a spreadsheet in CSV UTF-8 format from Microsoft Excel, 
	for example, will include a BOM. On the web this is not usually 
	a problem because the UTF-8 decode algorithm specified in the 
	Encoding standard removes the BOM. Node.js, on the other hand, 
	does not remove the BOM when decoding UTF-8.
*/

const strip_bom = require('strip-bom');

const parsers = {
	'.ndtxt': file => file.contents.split(/\n/),
	'.json': file => JSON.parse(file.contents),
	'.yaml': file => yaml.safeLoad(file.contents),
	'.csv': file => csvParse(strip_bom(file.contents)),
	'.tsv': file => tsvParse(strip_bom(file.contents)),
	'.js': async file => {
		let module = require(path.resolve(file.cwd, file.path));
		return typeof module === 'function' ? await module() : module;
	}
};

module.exports = async file => {
	let parser = parsers[file.extname];
	if (parser) {
		file.data = await parser(file);
	} else {
		throw new Error('Could not find appropriate parser for file.');
	}
	return file;
};
