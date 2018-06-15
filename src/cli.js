// const chalk = require('chalk');
const program = require('commander'); // alternative: sade
const version = require('../package.json').version;

const Bundler = require('./bundler');

const bundler = new Bundler();

program.version(version);
program.parse(process.argv);
