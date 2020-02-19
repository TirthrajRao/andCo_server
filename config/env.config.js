const chalk = require('chalk');
const path = require('path');
var envs = [];
const settings = require('./env.json')
envs['production'] = {
    name: 'production',
    url: 'https://admin.triviapost.in:5000/api/',
    https: true,
    port: 3000,
    settings: settings.production,
    common: settings.common
};
envs['development'] = {
    name: 'development',
    url: 'http://127.0.0.1',
    https: false,
    port: 3000,
    settings: settings.development,
    common: settings.common,
    // redirectTo: 'http://localhost:4200/#/'
};
envs['testing'] = {
    name: 'test',
    url: '',
    https: true,
    port: 3001,
    settings: settings.testing,
    common: settings.common,
    // redirectTo: 'http://conduct-testing.raoinformationtechnology.com/#/'
}
// Set environment dynamically at runtime
var env = process.env.NODE_ENV;
// Default to development environment if NODE_ENV is undefined.
if (!env || !envs[env]) {
    console.log('NODE_ENV is undefined or its value was not understood. Default to development mode. ');
    env = 'testing';
}
// console.log('Starting in', chalk.greenBright(env), 'mode...');
module.exports = envs[env];