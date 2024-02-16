import TcpSocket from 'react-native-tcp-socket';
import TCPConnectionHandler from '../network/TCPConnectionHandler';
import NetInfo from '@react-native-community/netinfo';

// https://www.npmjs.com/package/react-native-tcp-socket

//This is how you connect

// new TCPClient({
//     port: 1337,
//     host: '18.215.226.116'
// }).connect()
//   .then(() => {
//      console.log('TCPClient:::connected');
//      client.on('data', (data) => {});
//      client.on('error', (error) => {});
//      .
//      .
//      client.write('hello world');
//     })
//     .catch((e) => {});
export default class TCP {
    /**
     *
     * @param {*} data exanmple: {message:"",  dest_port: 1337, dest_ip: '18.215.226.116' }
     */
    static sendMessage(data) {
        console.log('~~~~ TCP send recieved in capability', data);
        TCPConnectionHandler.sendMessage(data);
    }

    static getIpAddress() {
        return new Promise((resolve, reject) => {
            NetInfo.fetch()
                .then((state) => {
                    resolve(state.details.ipAddress);
                })
                .catch((err) => reject(err));
        });
    }
}
