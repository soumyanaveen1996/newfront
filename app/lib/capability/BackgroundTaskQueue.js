import BackgroundTaskDAO from '../persistence/BackgroundTaskDAO';

export class BackgroundTaskError extends Error {
    constructor(code, message) {
        super();
        this.code = code;
        this.message = message;
    }

    get code() {
        return this.code;
    }

    get message() {
        return this.message;
    }
}

export const BackgroundTaskErrorCodes = {
    0: 'key option is required',
    1: 'botId option is required',
    2: 'timeInterval  option is required',
    3: 'conversationId  option is required',
    4: 'Unable to enqueue background task',
    5: 'Unable to dequeue background task',
}

class BackgroundTaskQueue {
    constructor() {
    }

    enqueue(options) {
        return new Promise((resolve, reject) => {
            if (!options.key) {
                reject(new BackgroundTaskError(0, BackgroundTaskErrorCodes[0]));
            }
            if (!options.botId) {
                reject(new BackgroundTaskError(1, BackgroundTaskErrorCodes[1]));
            }
            if (!options.timeInterval) {
                reject(new BackgroundTaskError(2, BackgroundTaskErrorCodes[2]));
            }
            if (!options.conversationId) {
                reject(new BackgroundTaskError(3, BackgroundTaskErrorCodes[3]));
            }
            BackgroundTaskDAO.insertBackgroundTaskIfNotPresent(options.key,
                options.botId,
                options.conversationId,
                options.timeInterval, options)
                .then(resolve)
                .catch(() => {
                    reject(new BackgroundTaskError(4, BackgroundTaskErrorCodes[4]));
                })
        });
    }

    dequeue(options) {
        if (!options.key) {
            reject(new BackgroundTaskError(0, BackgroundTaskErrorCodes[0]));
        }
        if (!options.botId) {
            reject(new BackgroundTaskError(1, BackgroundTaskErrorCodes[1]));
        }
        BackgroundTaskDAO.deleteBackgroundTask(options.key, options.botId)
            .then(resolve)
            .catch(() => {
                reject(new BackgroundTaskError(5, BackgroundTaskErrorCodes[5]));
            });
    }
}

export default new BackgroundTaskQueue();
