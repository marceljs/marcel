require('v8-compile-cache');
const program = require('commander');
const pkg = require('../package.json');
const handler = require('serve-handler');
const micro = require('micro');
const Bundler = require('./bundler');
const config = require('./config');

const cfg = config();

program.version(pkg.version);

async function bundle() {
	await new Bundler(cfg).run();
}

program
	.command('serve')
	.description('Start a development server')
	.option('--port [port]', 'port (default: 3000)')
	.action(async function(options) {
		await bundle();
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
	.command('build', { isDefault: true })
	.description('Build the website')
	.action(bundle);

program.parse(process.argv);
