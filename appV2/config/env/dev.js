import _ from 'lodash';
import commonConfig from './common';

const S3_HOST = 's3.amazonaws.com';
const CATALOG_HOST = 'mq2bsx6jae.execute-api.us-east-1.amazonaws.com';
const QUEUE_HOST = 'oc8208kdrk.execute-api.us-east-1.amazonaws.com';
const PROXY_HOST = 'elbdev.frontms.ai';

// Overwrite any properties for dev.
const devConfig = {
    name: 'For internal use only(Dev)',
    useLocalBots: true,
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
        // resource_host_old: 'elbdev.frontm.ai',
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
        deleteContacts: '/contactsActions',
        webertcSignalServer: 'gwdev.frontm.ai',
        pstnServer: 'pstn-dev.frontm.ai',
        filesAPI: 'https://3nf11ibj25.execute-api.us-east-1.amazonaws.com/dev',
        // contentURL:
        //   "https://s3.amazonaws.com/frontm-contentdelivery-mobilehub-1030065648/botLogos/",
        contentURL: 'https://gwdev.frontm.ai/devproxy/botLogos/',
        channelLogos: 'channelLogos/',
        conferenceUrl: 'https://meetdev.frontm.ai/',
        defaultMediasoupServer: 'meetdev.frontm.ai',
        mediasoupServers: [
            'meetdev.frontm.ai',
            'meet.frontm.ai',
            'loft.frontm.ai'
        ],
        meetingServersMapping: {
            'meetdev.frontm.ai': 'jitsi',
            'meet.frontm.ai': 'jitsi',
            'loft.frontm.ai': 'jitsi',
            'loft2.frontm.ai': 'jitsi',
            'telemet.frontm.ai': 'jitsi',
            'testjitsi.frontm.ai': 'jitsi',
            'telemed.frontm.ai': 'jitsi'
        }
    },
    twilioEnv: 'dev',
    grpcURL: 'https://gwdev.frontm.ai/grpc',
    socketURL: 'https://gwdev.frontm.ai',
    sockerPath: '/grpc/clientConn',
    homeBannerlinks: {
        onship: [
            {
                tyop: 'blank',
                image:
                    'https://592975064982-frontm-contentdelivery-production.s3.amazonaws.com/graphics/homeBannerImages/banner+image+1-welcome+B%403x.png'
            },
            {
                title: 'Explore app marketplace',
                info:
                    'All your collaboration, productivity and welfare apps. Now in one place.',
                type: 'screen',
                data: 'Apps',
                image:
                    'https://592975064982-frontm-contentdelivery-production.s3.amazonaws.com/graphics/homeBannerImages/banner+image+1-apps%403x.png'
            },
            {
                title: 'Connect with rank and roles',
                info:
                    'Private and secure communication for your ship and shore use.',
                type: 'screen',
                data: 'Contacts',
                image:
                    'https://592975064982-frontm-contentdelivery-production.s3.amazonaws.com/graphics/homeBannerImages/banner+image+2-contacts%403x.png'
            },
            {
                title: 'Keep profile up to date',
                info:
                    'Grow your professional network. Enable safe and trusted connections.',
                type: 'screen',
                data: 'myProfileScreenOnship',
                image:
                    'https://592975064982-frontm-contentdelivery-production.s3.amazonaws.com/graphics/homeBannerImages/banner+image+3-credit%403x.png'
            }
        ],
        onshipqa: [
            {
                tyop: 'blank',
                image:
                    'https://592975064982-frontm-contentdelivery-production.s3.amazonaws.com/graphics/homeBannerImages/banner+image+1-welcome+B%403x.png'
            },
            {
                title: 'Explore app marketplace',
                info:
                    'All your collaboration, productivity and welfare apps. Now in one place.',
                type: 'screen',
                data: 'Apps',
                image:
                    'https://592975064982-frontm-contentdelivery-production.s3.amazonaws.com/graphics/homeBannerImages/banner+image+1-apps%403x.png'
            },
            {
                title: 'Connect with rank and roles',
                info:
                    'Private and secure communication for your ship and shore use.',
                type: 'screen',
                data: 'Contacts',
                image:
                    'https://592975064982-frontm-contentdelivery-production.s3.amazonaws.com/graphics/homeBannerImages/banner+image+2-contacts%403x.png'
            },
            {
                title: 'Keep profile up to date',
                info:
                    'Grow your professional network. Enable safe and trusted connections.',
                type: 'screen',
                data: 'myProfileScreenOnship',
                image:
                    'https://592975064982-frontm-contentdelivery-production.s3.amazonaws.com/graphics/homeBannerImages/banner+image+3-credit%403x.png'
            }
        ]
    }
};

const config = {};

_.merge(config, commonConfig, devConfig);

export default config;
