module.exports = {
    presets: [
        '@vue/cli-plugin-babel/preset',
        [
            '@babel/preset-env', {
                targets: {
                    firefox: "50"
                },
                'corejs': '3.6.5',
                useBuiltIns: 'usage'
            }
        ]
    ],
    'plugins': [
        "@babel/plugin-proposal-class-properties"
    ]
}
