import {
    accelerometer,
    gyroscope,
    magnetometer,
    barometer,
    setUpdateIntervalForType,
    SensorTypes
} from 'react-native-sensors';
import { Message, ConversationContext } from '.';
import moment from 'moment';
import { sendBackgroundMessageSafe } from '../BackgroundTask/BackgroundTaskProcessor';
import { Bot } from '../dce';
import { Conversation } from '../conversation';

const activeAccelerometers = {};

export class Accelerometer {
    /**
     * When called, the bot with id botId will start to receive sensor Messages of type Accelerator with the updated from the device.
     * @param {String} botId of the bot that request the capability
     * @param {String} conversationId
     * @param {Number} frequency of the updates in Hz
     */
    static async startUpdates(botId, conversationId, frequency = 60) {
        try {
            if (botId && conversationId) {
                const allBots = await Bot.allInstalledBots();
                const foundBot = allBots.find(bot => {
                    return bot.botId === botId;
                });
                if (foundBot) {
                    setUpdateIntervalForType(
                        SensorTypes.accelerometer,
                        1000 / frequency
                    );
                    const subscription = accelerometer.subscribe(
                        ({ x, y, z, timestamp }) => {
                            const update = { x, y, z };
                            let message = new Message({
                                addedByBot: true,
                                messageDate: moment().valueOf()
                            });
                            // message.setCreatedBy();
                            message.sensorMessage(update, {
                                type: SensorTypes.accelerometer
                            });
                            sendBackgroundMessageSafe(
                                message,
                                botId,
                                conversationId
                            );
                        }
                    );
                    activeAccelerometers[botId + conversationId] = subscription;
                } else {
                    throw new Error('bot not found');
                }
            } else {
                throw new Error('botId and conversationId required');
            }
        } catch (error) {
            console.log('Accelerometer startUpdates ERROR: ', error.message);
            throw error;
        }
    }

    /**
     * Stops the Accelerometer updates for the bot.
     * @param {*} botId
     * @param {*} conversationId
     */
    static stopUpdates(botId, conversationId) {
        if (activeAccelerometers[botId + conversationId]) {
            activeAccelerometers[botId + conversationId].unsubscribe();
        }
    }
}

//TODO: other sensors...
