import _ from 'lodash';
import commonConfig from './common';

const S3_HOST = 's3.amazonaws.com';
const CATALOG_HOST = 'mq2bsx6jae.execute-api.us-east-1.amazonaws.com';
const QUEUE_HOST = 'oc8208kdrk.execute-api.us-east-1.amazonaws.com';
const PROXY_HOST = 'api.frontm.ai';

// Overwrite any property as desired.
const stageConfig = {
    name: undefined,
    useLocalBots: true,
    bot: {
        baseProtocol: 'https://',
        baseUrl: S3_HOST,
        s3bucket: '592975064982-frontm-contentdelivery-production',
        s3ServiceApi: 's3',
        binaryS3Bucket: 'prod-frontm-conversations',
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
        resource_host_old: 'api.frontm.ai',
        resource_host: 'gw.frontm.ai/proxy/resource',
        protocol: 'https://',
        queuePath: '/queueLambda',
        pingPath: '/ping',
        user_details_path: 'api.frontm.ai/twilio/getusername',
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
        webertcSignalServer: 'gw.frontm.ai',
        pstnServer: 'pstn-prod.frontm.ai',
        filesAPI: 'https://gw.frontm.ai/proxy/resource',
        // contentURL: "https://s3.amazonaws.com/592975064982-frontm-contentdelivery-production/botLogos/",
        contentURL: 'https://gw.frontm.ai/proxy/botLogos/',
        channelLogos: 'channelLogos/',
        conferenceUrl: 'https://meet.frontm.ai/',
        defaultMediasoupServer: 'meet.frontm.ai',
        mediasoupServers: ['meet.frontm.ai', 'loft.frontm.ai'],
        meetingServersMapping: {
            'meetdev.frontm.ai': 'jitsi',
            'meet.frontm.ai': 'jitsi',
            'loft.frontm.ai': 'jitsi',
            'loft2.frontm.ai': 'jitsi',
            'telemet.frontm.ai': 'jitsi',
            'telemed.frontm.ai': 'jitsi'
        }
    },
    twilioEnv: 'rackspaceProd',
    grpcURL: 'https://gw.frontm.ai/grpc',
    socketURL: 'https://gw.frontm.ai',
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
        ],
        BWGroup: [
            {
                info: 'Contacts',
                type: 'screen',
                data: 'Contacts',
                image:
                    'https://592975064982-frontm-contentdelivery-production.s3.amazonaws.com/graphics/homeBannerImages/BWGroup/BW+Group+Contacts.png'
            },
            {
                info: 'Apps',
                type: 'screen',
                data: 'Apps',
                image:
                    'https://592975064982-frontm-contentdelivery-production.s3.amazonaws.com/graphics/homeBannerImages/BWGroup/BW+Group+Apps.png'
            },
            {
                info: 'Bot',
                type: 'bot',
                data: 'mPXDsmTSdaCWyx7gM8fYFS',
                image:
                    'https://592975064982-frontm-contentdelivery-production.s3.amazonaws.com/graphics/homeBannerImages/BWGroup/BW+Group+ComapsBot.png'
            },
            {
                info: 'Bot',
                type: 'bot',
                data: 'jADnfaav6j9TpVMgH4kbvW',
                image:
                    'https://592975064982-frontm-contentdelivery-production.s3.amazonaws.com/graphics/homeBannerImages/BWGroup/BW+Group+VitrioBot.png'
            }
        ],
        onecare: [],
        onecareuat: []
    }
};

const config = {};

_.merge(config, commonConfig, stageConfig);

export default config;
