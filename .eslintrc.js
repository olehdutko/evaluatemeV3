module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: ['./apps/*/tsconfig.json', './packages/*/tsconfig.json'],
    tsconfigRootDir: __dirname,
    sourceType: 'module',
    ecmaVersion: 2022,
  },
  plugins: ['@typescript-eslint', 'import'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'plugin:import/recommended',
    'plugin:import/typescript',
  ],
  ignorePatterns: ['node_modules/', 'dist/', '.next/', 'coverage/', '*.js'],
  rules: {
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/ban-ts-comment': [
      'error',
      {
        'ts-ignore': true,
        'ts-nocheck': true,
        'ts-expect-error': true,
        'minimumDescriptionLength': 0,
      },
    ],
    '@typescript-eslint/no-unsafe-assignment': 'error',
    '@typescript-eslint/no-unsafe-member-access': 'error',
    '@typescript-eslint/no-unsafe-call': 'error',
    '@typescript-eslint/no-unsafe-return': 'error',
    'import/no-restricted-paths': [
      'error',
      {
        zones: [
          {
            target: './packages/domain/src',
            from: './node_modules/@nestjs',
            message: 'Domain layer must not import NestJS packages',
          },
          {
            target: './packages/domain/src',
            from: './node_modules/@prisma/client',
            message: 'Domain layer must not import Prisma client',
          },
          {
            target: './packages/domain/src',
            from: './node_modules/next',
            message: 'Domain layer must not import Next.js',
          },
          {
            target: './packages/domain/src',
            from: './node_modules/react',
            message: 'Domain layer must not import React',
          },
        ],
      },
    ],
  },
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.ts', '.tsx', '.js', '.jsx'],
      },
      typescript: {
        alwaysTryTypes: true,
        project: ['./apps/*/tsconfig.json', './packages/*/tsconfig.json'],
      },
    },
  },
};
