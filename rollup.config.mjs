import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';
import { readFileSync } from 'node:fs';
import postcss from 'postcss';
import cssImport from 'postcss-import';
import sass from 'rollup-plugin-sass';
import serve from 'rollup-plugin-serve';
import terser from '@rollup/plugin-terser';
import uncss from 'uncss';
import ts from 'rollup-plugin-ts';
import { nodeResolve } from '@rollup/plugin-node-resolve';

const favicon = readFileSync('./tg.png').toString('base64');
const template = (style, script) =>
    `<html><head><meta charset="UTF-8"><link rel="icon" type="image/png" href="data:image/png;base64,${favicon}"><meta http-equiv="X-UA-Compatible" content="IE=edge"><meta name="viewport" content="width=device-width, initial-scale=1.0"><style>${style}</style></head><body><a id="w" href="#"><span id="l"></span></a><script>${script}</script></body></html>`;

let style = '';

export default {
    input: 'index.ts',
    output: {
        format: 'esm',
        file: 'index.js'
    },
    plugins: [
        nodeResolve({ modulesOnly: true }),
        sass({
            processor: css =>
                postcss(
                    cssImport(),
                    autoprefixer({ remove: true }),
                    cssnano({ preset: ['advanced', { discardComments: { removeAll: true } }] })
                )
                    .process(css, { from: undefined })
                    .then(
                        c =>
                            new Promise((resolve, reject) =>
                                //@ts-ignore
                                uncss(template('', ''), { raw: c.css }, (err, output) => {
                                    if (err) {
                                        reject(err);
                                    } else {
                                        resolve((style = output));
                                    }
                                })
                            )
                    )
        }),
        ts({
            browserslist: false,
            transpiler: 'typescript',
            exclude: '**/node_modules/**'
        }),
        terser({
            ecma: 5,
            module: true,
            toplevel: true,
            mangle: {
                reserved: ['location', 'document']
            },
            output: {
                comments: false
            }
        }),
        {
            generateBundle(_, bundle) {
                this.emitFile({
                    type: 'asset',
                    name: '404',
                    fileName: '404.html',
                    source: template(style, Object.values(bundle)[0].code.trim())
                });
            }
        },
        process.env.ROLLUP_WATCH &&
            serve({
                open: true,
                openPage: '/404.html#taraflex',
                contentBase: '',
                historyApiFallback: false,
                host: '127.0.0.1',
                port: 3215
            })
    ]
};
