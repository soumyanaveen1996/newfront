import { DeviceStorage } from '.';

class BotStateHandler {
    constructor(options) {
        if (!options.key) {
            throw new Error('key option is required');
        }
        this.persist = options.persist || true;
        this.key = options.key
    }

    get(obj, key) {
        return obj[key];
    }

    set(obj, key, value) {
        obj[key] = value;
        this.persistIfRequired(obj)
    }

    deleteProperty(obj, key) {
        if (key in obj) {
            delete obj[key];
        }
        this.persistIfRequired(obj)
    }

    persistIfRequired(obj) {
        if (this.persist) {
            DeviceStorage.save(key, obj);
        }
    }
}

/*
    var a = State.newState({key: 'amal'});
    a.b = 10;
    a.c = 20;
    delete a.b;
*/

export default class State {
    static newState(options) {
        return new Promise((resolve) => {
            DeviceStorage.get(options.key)
                .then((value) => {
                    if (value) {
                        resolve(new Proxy(value, new BotStateHandler(options)));
                    } else {
                        resolve(new Proxy({}, new BotStateHandler(options)));
                    }
                })
        })
    }
}