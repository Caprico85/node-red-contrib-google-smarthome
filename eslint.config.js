const js = require('@eslint/js');
const jsdoc = require('eslint-plugin-jsdoc'); 
const globals = require('globals'); 

/** @type {import('eslint').Linter.FlatConfig[]} */
module.exports = [
    js.configs.recommended,
    jsdoc.configs['flat/recommended'],
    {
        files: ["**/*.js", "**/*.html"],
        languageOptions: {
            ecmaVersion: 12,
            sourceType: 'commonjs',
            globals: {
            //    ...globals.browser,
                ...globals.commonjs,
                ...globals.es2021,
            //    ...globals.jquery,
            
            //    ...globals.es6,
            //    ...globals.node,
                RED: "readonly"
            },
            sourceType: "commonjs"
        },
        plugins: {
            jsdoc: jsdoc,
        },
        settings: {
            jsdoc: {
                // TODO: ?
                mode: "typescript"
            }
        },
        rules: {
            "indent": ["error", 4, {
                "SwitchCase": 1
            }],
            "jsdoc/require-hyphen-before-param-description": 1,
            "jsdoc/tag-lines": ["error", "any", {
                "startLines": 1
            }],
        }
    },
    {
        files: ["test/**/*.js"],
        languageOptions: {
            globals: {
                ...globals.mocha,
            },
        },
    }
];
