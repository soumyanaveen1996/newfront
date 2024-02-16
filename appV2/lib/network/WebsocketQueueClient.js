import io from 'socket.io-client';
import { AppState } from 'react-native';
import { Auth } from '../../lib/capability';
import _ from 'lodash';
import config from '../../config/config';
import EventEmitter, { TimelineEvents } from '../events';
import { Connection } from '../events/Connection';
import { setSocketState } from '../../redux/actions/UserActions';
import Store from '../../redux/store/configureStore';

export class WebsocketQueueClient {
    constructor() {
        this.setupListeners();
        this.connecting = false;
        this.messageHandler = null;
    }

    setupListeners = () => {
        AppState.addEventListener('change', this.handleAppStateChange);
        EventEmitter.addListener(
            Connection.netWorkStatusChange,
            this.handleNetworkChange.bind(this)
        );
    };

    handleAppStateChange = async (nextAppState) => {
        if (nextAppState == 'active') {
            this.reconnect();
        }
    };

    handleNetworkChange = (event) => {
        if (this.messageHandler === null) return;
        if (event.isConnected) {
            console.log(
                'Launching:::: SOCKET Websocket initiating connect on netwrk chage',
                this.socket
            );
            if (!this.socket) {
                this.setupQueueMessageStream();
            } else {
                this.socket.connect();
            }
        } else {
            if (this.socket) {
                this.close();
            }
        }
    };

    setMessageHandler = (messageHandler) => {
        this.messageHandler = messageHandler;
    };

    close = () => {
        if (this.socket) {
            this.socket.removeAllListeners();
            this.socket.close();
            this.connecting = false;
        }
        this.socket = null;
    };

    reconnect = () => {
        if (!this.socket) {
            this.setupQueueMessageStream();
            return;
        } else if (!this.socket.connected) {
            this.connect();
        }
    };

    isConnected = () => {
        return this.socket?.connected;
    };

    connect = () => {
        if (this.socket && !this.socket.connected && !this.connecting) {
            this.connecting = true;
            this.socket.connect();
        }
    };

    setupQueueMessageStream = async () => {
        try {
            let userData = await Auth.getUser();
            let email = userData.info.emailAddress;
            if (this.socket) {
                return;
            }
            this.socket = io(config.socketURL, {
                path: config.sockerPath,
                transports: ['websocket', 'polling'],
                // rejectUnauthorized: false,
                extraHeaders: {
                    sessionId: _.get(userData, 'creds.sessionId', null)
                },
                transportOptions: {
                    polling: {
                        extraHeaders: {
                            sessionId: _.get(userData, 'creds.sessionId', null)
                        }
                    },
                    websocket: {
                        extraHeaders: {
                            sessionId: _.get(userData, 'creds.sessionId', null)
                        }
                    }
                },
                reconnection: false,
                withCredentials: true
            });

            this.socket.on('connect', () => {
                console.log(
                    'Launching:::: SOCKET successfully connected!',
                    this.socket
                );
                Store.dispatch(setSocketState('connected'));

                EventEmitter.emit(TimelineEvents.socketConnected);
                networkState = 'CONNECTED';
                console.log('========= Socket connected==========');
                this.connecting = false;
                this.socket.emit('getMessages');
            });

            this.socket.on('disconnect', (reason) => {
                console.log('SOCKET disconnected :', reason);
                networkState = 'DISCONNECTED';
                Store.dispatch(setSocketState('disconnected'));
                EventEmitter.emit(TimelineEvents.socketConnected);
                console.log('======== Socket disconnected =========');
                if (reason !== 'io client disconnect') {
                    // the disconnection was initiated by the server, you need to reconnect manually
                    this.socket.close();
                    this.connect();
                }
            });
            this.socket.on(email, (data) => {
                if (typeof data.data === 'string') {
                    this.messageHandler &&
                        this.messageHandler(JSON.parse(data.data));
                } else {
                    this.messageHandler && this.messageHandler(data.data);
                }
            });
            this.socket.on('reconnect_attempt', () => {
                console.log('SOCKET reconnect_attempt');
            });

            this.socket.on('reconnect', () => {
                console.log('SOCKET reconnect');
            });
            this.socket.on('connect_error', (error) => {
                console.log('SOCKET connect_error', error);
                Store.dispatch(setSocketState('error'));
                EventEmitter.emit(TimelineEvents.socketConnected);
            });
            return this.socket;
        } catch (error) {
            console.log('SOCKET error', error);
        }
    };
}

export default new WebsocketQueueClient();
