require('v8-compile-cache');
const program = require('commander');
const pkg = require('../package.json');
const handler = require('serve-handler');
const micro = require('micro');
const Bundler = require('./bundler');
const config = require('./config');

const cfg = config();

program.version(pkg.version);

async function bundle(options) {
	await new Bundler(cfg).run({
		drafts: options.drafts
	});
}

program;

program
	.command('serve')
	.description('Start a development server')
	.option('-d, --drafts', 'Include drafts')
	.option('--port [port]', 'port (default: 3000)')
	.action(async function(options) {
		await bundle(options);
		const server = micro(async (req, res) => {
			return handler(req, res, {
				public: cfg.distDir
			});
		});
		let p = options.port || 3000;
		server.listen(p);
		console.log(`Started server at: http://localhost:${p}`);
	});

program
	.command('build')
	.option('-d, --drafts', 'Include drafts')
	.description('Build the website')
	.action(bundle);

if (process.argv.length < 3) {
	program.outputHelp();
}

program.parse(process.argv);
