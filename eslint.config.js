import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

// Configuración de ESLint: base de Vite (js.configs.recommended) extendida con
// reglas de hooks de React, refresh y convenciones propias del proyecto
export default [
    { ignores: ['dist', 'coverage', '.pnp.cjs', '.pnp.loader.mjs'] },
    {
        files: ['**/*.{js,jsx}'],
        languageOptions: {
            ecmaVersion: 2020,
            globals: { ...globals.browser, ...globals.vitest },
            parserOptions: {
                ecmaVersion: 'latest',
                ecmaFeatures: { jsx: true },
                sourceType: 'module',
            },
        },
        plugins: {
            'react-hooks': reactHooks,
            'react-refresh': reactRefresh,
        },
        rules: {
            ...js.configs.recommended.rules,
            ...reactHooks.configs.recommended.rules,
            'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
            'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
            'no-var': 'error',
            eqeqeq: ['error', 'smart'],
            // La indentación la gestiona Prettier (verificado en format:check)
        },
    },
];
