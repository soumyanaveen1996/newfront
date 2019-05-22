import commonConfig from './common';
import _ from 'lodash';

const S3_HOST = 's3.amazonaws.com';
const CATALOG_HOST = 'mq2bsx6jae.execute-api.us-east-1.amazonaws.com';
const QUEUE_HOST = 'oc8208kdrk.execute-api.us-east-1.amazonaws.com';
const PROXY_HOST = 'elbdev.frontms.ai';

// Overwrite any properties for dev.
const devConfig = {
    bot: {
        baseProtocol: 'https://',
        baseUrl: S3_HOST,
        s3bucket: 'frontm-contentdelivery-mobilehub-1030065648',
        s3ServiceApi: 's3',
        binaryS3Bucket: 'dev-frontm-conversations',
        catalogHost: CATALOG_HOST,
        catalogPath: '/Development/items',
        catalogServiceApi: 'execute-api'
    },
    network: {
        queueProtocol: 'https://',
        queueHost: QUEUE_HOST,
        queuePath: '/Development/items',
        pingPath: '/ping',
        queueServiceApi: 'execute-api',
        contactsPath: '/contacts',
        channelsPath: '/channels',
        userDetailsPath: '/userDetails'
    },
    proxy: {
        enabled: true,
        host: 'deprecated',
        resource_host_old: 'elbdev.frontm.ai',
        resource_host: '3nf11ibj25.execute-api.us-east-1.amazonaws.com/dev',
        user_details_path:
            'ui33wrefvj.execute-api.us-east-1.amazonaws.com/item/getusername',
        protocol: 'https://',
        queuePath: '/queueLambda',
        pingPath: '/ping',
        catalogPath: '/catalog',
        authPath: '/auth',
        refreshPath: '/v2/refresh',
        conversationPath: '/conversation',
        signupPath: '/signup/frontm',
        signinPath: '/signin/frontm',
        updateSigninPath: '/v2/updateSignin/frontm',
        deleteUserPath: '/v2/deleteUser',
        newProvider: '/v2/subscribeDomain',
        searchCatalog: '/catalog',
        userInfo: '/user',
        profileImage: '/v2/file/profile-pics/',
        addFavourite: '/users/favourites',
        deleteContacts: '/contactsActions'
    }
};

let config = {};

_.merge(config, commonConfig, devConfig);

export default config;
