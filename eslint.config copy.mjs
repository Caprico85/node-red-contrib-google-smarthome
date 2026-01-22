import js from '@eslint/js';
import jsdoc from 'eslint-plugin-jsdoc';
import globals from 'globals';
import tseslint from 'typescript-eslint';

/** @type {import('eslint').Linter.Config[]} */
export default tseslint.config(
    {
        ignores: [
            "dist/**",
            "**/*.js",
        ],
    },
    js.configs.recommended,
    jsdoc.configs['flat/recommended'],
    ...tseslint.configs.recommendedTypeChecked,
    {
        files: ["**/*.ts"],
        languageOptions: {
            globals: {
                ...globals.es2021,
                ...globals.node,
                RED: "readonly",
            },
            parserOptions: {
                project: "./tsconfig.json",
                tsconfigRootDir: import.meta.dirname,
                projectService: true,
            },
            sourceType: "module",
        },
        settings: {
            jsdoc: {
                mode: "typescript",
            },
        },
        rules: {
            "indent": ["error", 4, {
                "SwitchCase": 1
            }],
            "jsdoc/require-hyphen-before-param-description": 1,
            "jsdoc/tag-lines": ["error", "any", {
                "startLines": 1
            }],
        },
    },
    {
        files: ["test/**/*.ts"],
        languageOptions: {
            globals: {
                ...globals.mocha,
            },
        },
    }
);
