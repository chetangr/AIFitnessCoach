module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./'],
        extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
        alias: {
          '@': './src',
          '@components': './src/components',
          '@screens': './src/screens',
          '@services': './src/services',
          '@store': './src/store',
          '@navigation': './src/navigation',
          '@types': './src/types',
          '@utils': './src/utils',
          '@constants': './src/constants',
          '@assets': './assets',
        },
      },
    ],
    'react-native-reanimated/plugin',
  ],
};