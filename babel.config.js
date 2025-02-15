module.exports = function (api) {
    // Cache cấu hình để tăng hiệu suất
    api.cache(true);

    return {
        presets: [
            "module:metro-react-native-babel-preset", // preset của React Native
            "@babel/preset-typescript", // thêm preset cho TypeScript
        ],
        plugins: [
            // Plugin decorators phải được cấu hình trước class properties.
            'react-native-reanimated/plugin',
            ["@babel/plugin-proposal-decorators", { legacy: true }],
            ["@babel/plugin-proposal-class-properties", { loose: true }],
        ],
        env: {
            production: {
                plugins: ["react-native-paper/babel"],
            },
        },
    };
};
