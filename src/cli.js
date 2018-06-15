// const chalk = require('chalk');
const program = require('commander'); // alternative: sade
const version = require('../package.json').version;

const Bundler = require('./bundler');

const bundler = new Bundler();

console.log(bundler.render());

program.version(version);
program.parse(process.argv);
