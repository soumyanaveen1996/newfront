import _ from 'lodash';
import commonConfig from './common';

// Overwrite any property as desired.
const prodConfig = {};

let config = {};

_.merge(config, commonConfig, prodConfig);

export default config;
