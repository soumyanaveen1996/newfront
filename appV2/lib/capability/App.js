import { NetworkPoller } from '../network';
import WebsocketQueueClient from '../network/WebsocketQueueClient';

export function stopProcessing() {
    NetworkPoller.stopPolling();
    WebsocketQueueClient.close();
}
export function startProcessing() {
    NetworkPoller.startPolling();
    WebsocketQueueClient.reconnect();
}

export default {
    stopProcessing,
    startProcessing
};
