(function () {
    const STORAGE_KEY_PREFIX = 'bot-async-request-uuid-';

    const saveAsyncRequest = function(botContext, requestUuid, data) {
        let DeviceStorage = botContext.getCapability('DeviceStorage');
        let store = {
            uuid: requestUuid,
            date: Date.now(),
            data: data || '',
        };
        const key = STORAGE_KEY_PREFIX + botContext.botManifest.id;

        // Two step process to save - to avoid array entanglement
        return new Promise(function (resolve, reject) {
            // 1. Add the requestUuid to the array
            DeviceStorage.saveArrayValue(key, requestUuid)
                .then(() => {
                    // 2. Save the actual object with the key as uuid
                    return DeviceStorage.save(requestUuid, store);
                })
                .then(() => {
                    return resolve(store);
                })
                .catch(function (err) {
                    console.log('Error saving the request', err);
                    reject(err);
                });
        });
    };

    // Return an array of pending requests
    const getAsyncRequests = function (botContext) {
        let DeviceStorage = botContext.getCapability('DeviceStorage');
        let Promise = botContext.getCapability('Promise');
        let Utils = botContext.getCapability('Utils');
        let _ = Utils.Lodash;
        const key = STORAGE_KEY_PREFIX + botContext.botManifest.id;

        return new Promise(function (resolve, reject) {
            return DeviceStorage.getArrayValues(key)
                .then((results) => {
                    results = results || [];
                    return Promise.all(_.map(results, function(requestUuid) {
                        return DeviceStorage.get(requestUuid);
                    }));
                })
                .then((resolvedObjs) => {
                    resolvedObjs = _.compact(resolvedObjs);
                    return resolve(resolvedObjs);
                })
                .catch(function (err) {
                    console.log('Error saving the request', err);
                    reject(err);
                });
        });
    };

    // Return an array of pending requests
    const removeAsyncRequest = function (botContext, requestUuid) {
        let DeviceStorage = botContext.getCapability('DeviceStorage');
        const key = STORAGE_KEY_PREFIX + botContext.botManifest.id;

        return new Promise(function (resolve, reject) {
            // 1. delete the actual object
            return DeviceStorage.delete(requestUuid)
                .then(() => {
                    // 2. delete from the array of requestUuids
                    return DeviceStorage.removeArrayValue(key, requestUuid)
                })
                .then(() => {
                    resolve();
                })
                .catch(function (err) {
                    console.log('Error saving the request', err);
                    reject(err);
                });
        });
    };

    return {
        saveAsyncRequest: saveAsyncRequest,
        getAsyncRequests: getAsyncRequests,
        removeAsyncRequest: removeAsyncRequest,
        version: '1.0.0'
    };
})();
