import _ from 'lodash';
import commonConfig from './common';

// Overwrite any property as desired. For local nothing
const localConfig = {};

let config = {};

_.merge(config, commonConfig, localConfig);

export default config;
