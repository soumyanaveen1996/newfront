import {
    accelerometer,
    gyroscope,
    magnetometer,
    barometer,
    setUpdateIntervalForType,
    SensorTypes
} from 'react-native-sensors';
import { Message } from '.';
import moment from 'moment';
import { sendBackgroundMessageSafe } from '../BackgroundTask/BackgroundTaskProcessor';

const activeAccelerometers = {};

export class Accelerometer {
    /**
     * When called, the bot with id botId will start to receive sensor Messages of type Accelerator with the updated from the device.
     * @param {String} botId of the bot that request the capability
     * @param {String} conversationId
     * @param {Number} frequency of the updates in Hz
     */
    static startUpdates(botId, conversationId, frequency = 60) {
        setUpdateIntervalForType(SensorTypes.accelerometer, 1000 / frequency);
        const subscription = accelerometer.subscribe(
            ({ x, y, z, timestamp }) => {
                const update = { x, y, z };
                let message = new Message();
                message.setCreatedBy({
                    addedByBot: true,
                    messageDate: moment().valueOf()
                });
                message.sensorMessage(update, {
                    type: SensorTypes.accelerometer
                });
                sendBackgroundMessageSafe(message, botId, conversationId);
            }
        );
        activeAccelerometers[botId + conversationId] = subscription;
    }

    /**
     * Stops the Accelerometer updates for the bot.
     * @param {*} botId
     * @param {*} conversationId
     */
    static stopUpdates(botId, conversationId) {
        activeAccelerometers[botId + conversationId].unsubscribe();
    }
}

//TODO: other sensors...
