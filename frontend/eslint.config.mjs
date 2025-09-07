import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": "error",
      "@typescript-eslint/no-non-null-assertion": "error",
      "@typescript-eslint/no-empty-function": "error",
      "@typescript-eslint/no-inferrable-types": "error",
      "@typescript-eslint/prefer-as-const": "error",
      "@typescript-eslint/no-array-constructor": "error",
      "@typescript-eslint/no-useless-constructor": "error",
      "@typescript-eslint/consistent-type-definitions": ["error", "interface"],
      "@typescript-eslint/naming-convention": [
        "error",
        {
          selector: "interface",
          format: ["PascalCase"],
        },
        {
          selector: "typeAlias",
          format: ["PascalCase"],
        },
        {
          selector: "enum",
          format: ["PascalCase"],
        },
        {
          selector: "variable",
          format: ["camelCase", "UPPER_CASE", "PascalCase"],
        },
        {
          selector: "function",
          format: ["camelCase", "PascalCase"],
        },
      ],
      "no-console": "off",
      "no-debugger": "error",
      "no-alert": "error",
      "no-var": "error",
      "prefer-const": "error",
      "prefer-template": "error",
      "template-curly-spacing": "error",
      "object-shorthand": "error",
      "prefer-destructuring": ["error", { object: true, array: false }],
      "no-duplicate-imports": "error",
      "arrow-spacing": "error",
      "comma-dangle": ["error", "always-multiline"],
      "comma-spacing": "error",
      "comma-style": "error",
      "computed-property-spacing": "error",
      "func-call-spacing": "error",
      indent: ["error", 2, { SwitchCase: 1 }],
      "key-spacing": "error",
      "keyword-spacing": "error",
      "no-multiple-empty-lines": ["error", { max: 1, maxEOF: 0 }],
      "no-trailing-spaces": "error",
      "object-curly-spacing": ["error", "always"],
      quotes: ["error", "double", { avoidEscape: true }],
      semi: ["error", "always"],
      "semi-spacing": "error",
      "space-before-blocks": "error",
      "space-before-function-paren": [
        "error",
        { anonymous: "always", named: "never", asyncArrow: "always" },
      ],
      "space-in-parens": "error",
      "space-infix-ops": "error",
      "space-unary-ops": "error",
      "spaced-comment": "error",
    },
  },
];

export default eslintConfig;
