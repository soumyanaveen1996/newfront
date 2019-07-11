import Queue from './Queue';
import NetworkHandler from './NetworkHandler';
import AsyncResultEventEmitter from './AsyncResultEventEmitter';
import NetworkError from './NetworkError';
import NetworkPoller from './NetworkPoller';
import IMBotMessageHandler from './IMBotMessageHandler';

const NETWORK_EVENTS_CONSTANTS = {
    result: 'result'
};

const NETWORK_STATE = {
    satellite: 'satellite',
    full: 'full',
    manual: 'manual',
    none: 'none'
};

export {
    Queue,
    NetworkHandler,
    AsyncResultEventEmitter,
    IMBotMessageHandler,
    NETWORK_EVENTS_CONSTANTS,
    NetworkError,
    NetworkPoller,
    NETWORK_STATE
};
