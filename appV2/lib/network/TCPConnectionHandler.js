import TcpSocket from 'react-native-tcp-socket';
import EventEmitter, { MessageEvents } from '../events';
import { Message, MessageTypeConstants } from '../capability';
import { UUID } from '../capability/Utils';

export default class TCPConnectionHandler {
    static connected = false;
    static client = null;
    static sendMessage(message) {
        if (this.connected) {
            console.log('~~~~ TCPClient alredy connected:::sending');
            const dataTobeSent = Buffer.from(message.msg);
            this.client.write(dataTobeSent, undefined, (e) => {
                console.log('TCPClient:::send ', e);
            });
        } else {
            const options = { port: message.dest_port, host: message.dest_ip };
            console.log('~~~~TCPClient::: attempting connection', options);
            this.client = TcpSocket.createConnection(options, () => {
                this.client.setTimeout(5 * 60 * 1000);
                console.log('~~~~TCPClient:::Connected');
                this.connected = true;
                const dataTobeSent = Buffer.from(message.msg);
                console.log('~~~~TCPClient:::sending', dataTobeSent);
                this.client.write(dataTobeSent, undefined, (e) => {
                    console.log('~~~~TCPClient:::send error ', e);
                });
                this.client.on('data', (data) => {
                    const newData = Buffer.from(data).toString();
                    console.log('~~~~TCPClient message was received', newData);
                    const msgId = UUID();
                    const msg = {
                        contentType: 4000,
                        requestUuid: UUID(),
                        messageId: msgId,
                        details: [
                            {
                                message: {
                                    messageType: 4000,
                                    messageId: msgId,
                                    message: newData
                                }
                            }
                        ]
                    };
                    EventEmitter.emit(MessageEvents.TCPmessageRecieved, {
                        message: msg,
                        origin: 'TCP'
                    });
                });
                this.client.on('error', (e) => {
                    console.log('~~~~TCPClient error', e);
                    TCPConnectionHandler.destroy();
                });
                this.client.on('close', () => {
                    console.log('~~~~TCPClient Connection closed!');
                    TCPConnectionHandler.destroy();
                });
            });
        }
    }

    static destroy() {
        if (this.client) {
            console.log('TCPClient destruyiong ');
            this.client.destroy();
            this.client = null;
            this.connected = false;
        }
    }
}
