// We are going to make lodash availalbe on the platform for making bot writing easier
import Lodash from 'lodash';
import moment from 'moment';
import AWSSignature from 'react-native-aws-signature';
import ShortUUID from 'short-uuid';

import config from '../../config/config';

const createAuthHeader = function (host, method, path, service, body = '', user) {
    const EMPTY_HASHED_PAYLOAD = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
    let options = {
        path: path,
        method: method,
        service: service,
        headers: {
            'X-Amz-Date': getAmzDate(new Date().toISOString()),
            'host': host,
            'X-Amz-Security-Token': user.aws.sessionToken
        },
        region: config.aws.region,
        body: JSON.stringify(body),
        credentials: {
            SecretKey: user.aws.secretAccessKey,
            AccessKeyId: user.aws.accessKeyId
        }
    };

    // The conteny-type header will be ignored if body is empty - so add it only if body is not empty
    if (body) {
        options.headers['Content-Type'] = 'application/json';
    }

    if (service === 's3') {
        options.headers['X-Amz-Content-Sha256'] = EMPTY_HASHED_PAYLOAD;
    }

    var awsSignature = new AWSSignature();
    awsSignature.setParams(options);
    var authorization = awsSignature.getAuthorizationHeader();
    options.headers.authorization = authorization.Authorization;
    return options.headers;
};

const getAmzDate = function (dateStr) {
    var chars = [':', '-'];
    for (var i = 0; i < chars.length; i++) {
        while (dateStr.indexOf(chars[i]) !== -1) {
            dateStr = dateStr.replace(chars[i], '');
        }
    }
    dateStr = dateStr.split('.')[0] + 'Z';
    return dateStr;
};

export function UUID() {
    let uuid = ShortUUID.uuid();
    return ShortUUID().fromUUID(uuid);
}

export default { Lodash, UUID, moment, createAuthHeader };
