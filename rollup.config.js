import autoprefixer from 'autoprefixer';
import { promisify } from 'util';
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

const wri = promisify(wi.html);

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
            async writeBundle() {
                await fs.writeFile('404.html', await wri({
                    fileContent: readFileSync('./dist/index.html', 'utf-8'),
                    relativeTo: './dist',
                    images: true
                }));
            }
        },
        process.env.ROLLUP_WATCH && serve({
            open: true,
            openPage: '/404.html#taraflex',
            contentBase: '',
            historyApiFallback: false,
            host: '127.0.0.1',
            port: 3215,
        })
    ]
};