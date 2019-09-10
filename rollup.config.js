import autoprefixer from 'autoprefixer';
import crypto from 'crypto';
import cssnano from 'cssnano';
import { promises as fs, readFileSync } from 'fs';
import postcss from 'postcss';
import cssImport from 'postcss-import';
import html from 'rollup-plugin-bundle-html';
import sass from 'rollup-plugin-sass';
import serve from 'rollup-plugin-serve';
import { terser } from 'rollup-plugin-terser';
import wi from 'web-resource-inliner';

export default {
    input: 'index.js',
    output: {
        format: 'esm',
        file: 'dist/bundle.js',
    },
    plugins: [
        sass({
            output: true,
            processor: css => postcss(
                cssImport(),
                //@ts-ignore
                autoprefixer(),
                cssnano({
                    preset: ['default', { discardComments: { removeAll: true } }]
                }),
            ).process(css, { from: undefined }).then(({ css }) => css)
        }),
        terser({
            ecma: 5,
            module: true,
            toplevel: true,
            mangle: {
                reserved: ['location', 'document']
            }
        }),
        html({
            template: 'template.html',
            filename: 'index.html',
            inject: 'body'
        }),
        {
            writeBundle: () => new Promise((resolve, reject) => {
                wi.html({ fileContent: readFileSync('./dist/index.html', 'utf-8'), relativeTo: './dist' }, async (err, content) => {
                    if (err) {
                        reject(err)
                    } else {
                        await Promise.all([
                            fs.writeFile('index.html', content),
                            fs.writeFile('app.appcache', 'CACHE MANIFEST\n# ' + crypto.createHash('md5').update(content).digest('base64').replace(/=/g, ''))
                        ]);
                        resolve();
                    }
                });
            })
        },
        serve({
            open: true,
            openPage: '/index.html#taraflex',
            verbose: true,
            contentBase: '',
            historyApiFallback: false,
            host: '127.0.0.1',
            port: 3215,
        })
    ]
};