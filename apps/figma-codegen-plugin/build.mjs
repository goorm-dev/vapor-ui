import esbuild from 'esbuild';
import { join } from 'path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const isProduction = process.env.NODE_ENV === 'production';

const baseConfig = {
    entryPoints: [join(__dirname, 'src/code.ts')],
    bundle: true,
    outfile: join(__dirname, 'dist/code.js'),
    platform: 'browser',
    target: 'es2017',
    format: 'iife',
    define: {
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
    },
    logLevel: 'info',
};

async function build() {
    try {
        await esbuild.build({
            ...baseConfig,
            minify: isProduction,
            sourcemap: !isProduction,
        });
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

if (process.argv.includes('--watch')) {
    const ctx = await esbuild.context({
        ...baseConfig,
        minify: false,
        sourcemap: true,
        define: {
            'process.env.NODE_ENV': JSON.stringify('development'),
        },
    });

    await ctx.watch();
    console.log('👀 Watching for changes...');
} else {
    await build();
}
