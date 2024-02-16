import { Logtail } from '@logtail/browser';
import { FileLogger, LogLevel } from 'react-native-file-logger';
import constants from '../../config/constants';
import RNFS from 'react-native-fs';
import moment from 'moment';

const logtail = new Logtail('DM862d2yyHvM2eiLSXpHoany');
FileLogger.configure({
    captureConsole: false,
    maximumNumberOfFiles: 1
    // formatter: (level, msg) => {
    //     var now = moment().format('DD MM YY hh:mm:ss:SSS');
    //     return `${now} :: ${msg}`;
    // }
})
    .then((res) => {
        console.log('logtofile confdgured:', res);
    })
    .catch((e) => {
        console.log('logtofile config error', e);
    });

export const logToFile = (msg) => {
    console.log('logtofile:', msg);
    // FileLogger?.write(LogLevel.Debug, msg);
};

export default logtail;
