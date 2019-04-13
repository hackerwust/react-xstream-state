module.exports = {
    "parser": "@typescript-eslint/parser",
    "parserOptions": {
        "sourceType": "module",
        "ecmaVersion": 2018,
    },
    "extends": [
        "ttdefault",
        "plugin:@typescript-eslint/recommended"
    ],
    "rules": {
        "react/prop-types": ["off"],
        "comma-dangle": ["error", "never"],
        "no-console": "warn",
        "operator-linebreak": "off",
        "eqeqeq": ["off"],
        "no-empty-function":"off",
        "no-useless-escape":"off",
        "no-unused-vars": ["error", { "vars": "local" }],
        "@typescript-eslint/interface-name-prefix": "never",
        "@typescript-eslint/no-object-literal-type-assertion": false,
        "@typescript-eslint/no-explicit-any": false,
        "@typescript-eslint/explicit-function-return-type": false
    },
    "globals": {
        "expect": true,
        "jest": true
    }
};