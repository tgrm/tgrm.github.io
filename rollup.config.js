import autoprefixer from 'autoprefixer';
import crypto from 'crypto';
import cssnano from 'cssnano';
import fs from 'fs';
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
        format: 'iife',
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
        terser(),
        html({
            template: 'template.html',
            filename: 'index.html',
            inject: 'body'
        }),
        {
            writeBundle() {
                wi.html({ fileContent: fs.readFileSync('./dist/index.html', 'utf-8'), relativeTo: './dist' }, function (err, content) {
                    if (err) {
                        console.error(err)
                    } else {
                        fs.writeFileSync('index.html', content);
                        fs.writeFileSync('app.appcache', 'CACHE MANIFEST\n# ' + crypto.createHash('md5').update(content).digest('base64').replace(/=/g, ''));
                    }
                });
            }
        },
        serve({
            open: true,
            openPage: '/index.html',
            verbose: true,
            contentBase: '',
            historyApiFallback: false,
            host: '127.0.0.1',
            port: 3215,
        })
    ]
};