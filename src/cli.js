require('v8-compile-cache');
const program = require('commander');
const pkg = require('../package.json');

const Bundler = require('./bundler');

const bundler = new Bundler();

program.version(pkg.version);
program.parse(process.argv);
