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
import uncss from 'uncss';
import wi from 'web-resource-inliner';

const template = `<html><head><meta charset="UTF-8"><link rel="icon" type="image/png" href="data:image/png;base64,${readFileSync('./tg.png').toString('base64')}"><meta http-equiv="X-UA-Compatible" content="IE=edge"><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta name="robots" content="noindex,nofollow"></head><body><a id="wrapper" href="#"><span id="label"></span></a></body></html>`;

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
                cssnano({ preset: ['advanced', { discardComments: { removeAll: true } }] }),
            ).process(css, { from: undefined }).then(c => new Promise((resolve, reject) => (
                //@ts-ignore
                uncss(template, { raw: c.css }, (err, output) => {
                    if (err) {
                        reject(err)
                    } else {
                        resolve(output)
                    }
                })
            )))
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
            template,
            filename: 'index.html',
            inject: 'body'
        }),
        {
            writeBundle: () => new Promise((resolve, reject) => {
                wi.html({
                    fileContent: readFileSync('./dist/index.html', 'utf-8').replace('<html>', '<html manifest="/app.appcache">'),
                    relativeTo: './dist',
                    images: true
                }, async (err, content) => {
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
        process.env.ROLLUP_WATCH && serve({
            open: true,
            openPage: '/#taraflex',
            verbose: true,
            contentBase: '',
            historyApiFallback: false,
            host: '127.0.0.1',
            port: 3215,
        })
    ]
};