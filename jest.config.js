'use strict';

const config = {
  collectCoverageFrom: ['lib/**/*.{js,jsx}'],
  coverageDirectory: 'coverage',
  coverageReporters: ['lcov'],
  maxWorkers: 1
};

module.exports = config;
