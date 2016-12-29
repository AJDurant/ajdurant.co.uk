module.exports = {
    "rules": {
        "indent": [
            2,
            4
        ],
        "quotes": [
            2,
            "single"
        ],
        "linebreak-style": [
            2,
            "unix"
        ],
        "semi": [
            2,
            "always"
        ],
        "node/no-missing-import": 2,
        "node/no-missing-require": 2,
        "node/shebang": 2
    },
    "env": {
        "node": true,
        "browser": true
    },
    "plugins": ["node"],
    "globals": {
        "node": true
    },
    "extends": "eslint:recommended"
};
