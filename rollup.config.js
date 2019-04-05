import html from 'rollup-plugin-bundle-html';
import sass from 'rollup-plugin-sass';
import { terser } from 'rollup-plugin-terser';
import fs from 'fs';
import wi from 'web-resource-inliner';
import autoprefixer from 'autoprefixer';
import postcss from 'postcss';
import atImport from "postcss-import";

function myExample() {
    return {
        writeBundle() {
            wi.html({ fileContent: fs.readFileSync('./dist/index.html', 'utf-8'), relativeTo: './dist' }, function (err, content) {
                if (err) {
                    console.error(err)
                } else {
                    fs.writeFileSync('index.html', content);
                }
            });
        }
    };
}

export default {
    input: 'index.js',
    output: {
        format: 'iife',
        file: 'dist/bundle.js',
    },
    plugins: [
        sass({
            output: true,
            processor: css => postcss([
                atImport(),
                autoprefixer({
                    browsers: ['last 2 version', '> 0.2%', 'ie >= 11']
                }),                
                require('cssnano')({
                    preset: ['default', {
                        discardComments: { removeAll: true }
                    }]
                }),
            ])
                .process(css)
                .then(result => result.css)
        }),
        terser(),
        html({
            template: '<html><head><meta charset="UTF-8"><meta http-equiv="X-UA-Compatible" content="IE=edge"><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta name="robots" content="noindex,nofollow"></head><body><a id="wrapper" href="#"><span id="label"></span></a></body></html>',
            filename: 'index.html',
            inject: 'body'
        }),
        myExample()
    ]
};