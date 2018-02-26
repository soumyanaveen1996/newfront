import _ from 'lodash';
import commonConfig from './common';

const S3_HOST = 's3.amazonaws.com';
const CATALOG_HOST = 'mq2bsx6jae.execute-api.us-east-1.amazonaws.com';
const QUEUE_HOST = 'oc8208kdrk.execute-api.us-east-1.amazonaws.com';
const PROXY_HOST = 'stage1.frontm.ai';

// Overwrite any property as desired.
const stageConfig = {
    bot: {
        baseProtocol: 'https://',
        baseUrl: S3_HOST,
        s3bucket: 'frontm-contentdelivery',
        s3ServiceApi: 's3',
        binaryS3Bucket: 'frontm-conversations',
        catalogHost: CATALOG_HOST,
        catalogPath: '/Development/items',
        catalogServiceApi: 'execute-api'
    },
    network: {
        queueProtocol: 'https://',
        queueHost: QUEUE_HOST,
        queuePath: '/Development/items',
        queueServiceApi: 'execute-api'
    },
    proxy: {
        enabled: true,
        host: PROXY_HOST,
        protocol: 'https://',
        queuePath: '/queueLambda',
        catalogPath: '/catalog',
        authPath: '/auth',
        refreshPath: '/refresh',
        conversationPath: '/conversation'
    }
};

let config = {};

_.merge(config, commonConfig, stageConfig);

export default config;
