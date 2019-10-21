import {
    accelerometer,
    gyroscope,
    magnetometer,
    barometer,
    setUpdateIntervalForType,
    SensorTypes
} from 'react-native-sensors';
import { Message } from '.';

const activeAccelerometers = {};

export const Accelerometer = {
    startUpdates: (botId, frequency = 60) => {
        setUpdateIntervalForType(SensorTypes.accelerometer, 1000 / frequency);
        const subscription = accelerometer.subscribe(
            ({ x, y, z, timestamp }) => {
                console.log('>>>>>>>>', { x, y, z, timestamp });
                const update = { x, y, z };
                let message = new Message({
                    messageType: 'ACCELEROMETER_UPDATE',
                    msg: update
                });
                const getNext = this.loadedBot.next(
                    message,
                    this.botState,
                    this.state.messages,
                    this.botContext
                );
            }
        );
        activeAccelerometers[botId] = subscription;
    },
    stopUpdates: botId => {
        activeAccelerometers[botId].unsubscribe();
    }
};
