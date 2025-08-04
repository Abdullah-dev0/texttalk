import path from "node:path";
import { fileURLToPath } from "node:url";

import { fixupConfigRules, fixupPluginRules } from "@eslint/compat";
import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import tsParser from "@typescript-eslint/parser";
import { defineConfig, globalIgnores } from "eslint/config";
import _import from "eslint-plugin-import";
import react from "eslint-plugin-react";
import unusedImports from "eslint-plugin-unused-imports";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
	baseDirectory: __dirname,
	recommendedConfig: js.configs.recommended,
	allConfig: js.configs.all,
});

export default defineConfig([
	globalIgnores(["**/node_modules/", "**/.next/", "**/build/", "**/dist/", "**/*.config.js", "**/*.config.ts"]),
	{
		extends: fixupConfigRules(
			compat.extends(
				"next/core-web-vitals",
				"eslint:recommended",
				"plugin:@typescript-eslint/recommended",
				"plugin:react/recommended",
				"plugin:react-hooks/recommended",
				"plugin:jsx-a11y/recommended",
				"plugin:import/recommended",
				"plugin:import/typescript",
				"prettier",
			),
		),

		plugins: {
			react: fixupPluginRules(react),
			import: fixupPluginRules(_import),
			"unused-imports": unusedImports,
		},

		languageOptions: {
			parser: tsParser,
		},

		settings: {
			react: {
				version: "detect",
			},

			"import/resolver": {
				typescript: true,
				node: true,
			},
		},

		rules: {
			"react/react-in-jsx-scope": "off",
			"react/prop-types": "off",

			"react/jsx-curly-brace-presence": [
				"error",
				{
					props: "never",
					children: "never",
				},
			],

			"react/self-closing-comp": [
				"error",
				{
					component: true,
					html: true,
				},
			],

			"import/order": [
				"error",
				{
					groups: ["builtin", "external", "internal", "parent", "sibling", "index"],
					"newlines-between": "always",

					alphabetize: {
						order: "asc",
					},
				},
			],

			"import/no-duplicates": "error",

			"unused-imports/no-unused-imports": "error",

			"no-console": [
				"warn",
				{
					allow: ["warn", "error"],
				},
			],

			eqeqeq: "error",
			"prefer-const": "error",
		},
	},
	{
		files: ["app/**/*.ts?(x)", "components/**/*.ts?(x)"],
	},
]);
