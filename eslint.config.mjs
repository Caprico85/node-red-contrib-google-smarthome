import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import ts from 'typescript-eslint';
import jsdoc from 'eslint-plugin-jsdoc';
import globals from 'globals';

export default defineConfig(
    // exclude build output
    {
        ignores: ["dist/**"]
    },

    js.configs.recommended,
    jsdoc.configs['flat/recommended'],
    ts.configs.strictTypeChecked,
    {
        languageOptions: {
            parserOptions: {
                projectService: true,
            },
        },
        rules: {
            '@typescript-eslint/no-unused-vars': 'error',
            '@typescript-eslint/explicit-function-return-type': 'warn',
            '@typescript-eslint/prefer-nullish-coalescing': 'error',
        },
        plugins: {
            jsdoc: jsdoc,
          //  '@typescript-eslint': typescript
        },
    },
);



/*
export default [

    {
        files: ['** /*.ts'],
        languageOptions: {
            parser: '@typescript-eslint/parser',
            parserOptions: {
                project: './tsconfig.json',
            },
            globals: {
                ...globals.es6,
                ...globals.node,
                RED: "readonly"
            },
            sourceType: "module"
        },
        plugins: {
            jsdoc: jsdoc,
            '@typescript-eslint': typescript
        },
        settings: {
            jsdoc: {
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
            '@typescript-eslint/no-unused-vars': 'error',
            '@typescript-eslint/explicit-function-return-type': 'warn',
            '@typescript-eslint/prefer-nullish-coalescing': 'error',
        }
    },

    {
        files: ["** /*.{js,mjs}"],
        languageOptions: {
            globals: {
                ...globals.es6,
                ...globals.node
            },
            sourceType: "module"
        },
        plugins: {
            jsdoc: jsdoc,
        },
        settings: {
            jsdoc: {
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

    // Lint test files
    {
        files: ["test/** /*.ts"],
        languageOptions: {
            globals: {
                ...globals.node,
                ...globals.mocha,
            },
        },
        settings: {
            jsdoc: {
                mode: "typescript"
            }
        },
    }
];
*/