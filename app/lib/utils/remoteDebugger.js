import { Platform } from 'react-native';
const R = require('ramda');
const axios = require('axios');

const RemoteLogger = text => {
    console.log(text);

    return;
    if (Platform.OS === 'android') {
        return;
    }

    axios
        .request({
            method: 'post',
            url:
                'https://hooks.slack.com/services/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',
            headers: {
                Accept: 'application/json'
            },
            data: {
                text
            },
            timeout: 10000
        })
        .catch(error => console.log('Cannot Log to Slack'));
    return;
};

export default RemoteLogger;
