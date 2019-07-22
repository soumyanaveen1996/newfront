(function() {
  var STORAGE_KEY_PREFIX = 'bot-async-request-uuid-';
  var saveAsyncRequest = function saveAsyncRequest(
    botContext,
    requestUuid,
    data
  ) {
    var DeviceStorage = botContext.getCapability('DeviceStorage');
    var store = { uuid: requestUuid, date: Date.now(), data: data || '' };
    var key = STORAGE_KEY_PREFIX + botContext.botManifest.id;
    return new Promise(function(resolve, reject) {
      DeviceStorage.saveArrayValue(key, requestUuid)
        .then(function() {
          return DeviceStorage.save(requestUuid, store);
        })
        .then(function() {
          return resolve(store);
        })
        .catch(function(err) {
          console.log('Error saving the request', err);
          reject(err);
        });
    });
  };
  var getAsyncRequests = function getAsyncRequests(botContext) {
    var DeviceStorage = botContext.getCapability('DeviceStorage');
    var Promise = botContext.getCapability('Promise');
    var Utils = botContext.getCapability('Utils');
    var _ = Utils.Lodash;
    var key = STORAGE_KEY_PREFIX + botContext.botManifest.id;
    return new Promise(function(resolve, reject) {
      return DeviceStorage.getArrayValues(key)
        .then(function(results) {
          results = results || [];
          return Promise.all(
            _.map(results, function(requestUuid) {
              return DeviceStorage.get(requestUuid);
            })
          );
        })
        .then(function(resolvedObjs) {
          resolvedObjs = _.compact(resolvedObjs);
          return resolve(resolvedObjs);
        })
        .catch(function(err) {
          console.log('Error saving the request', err);
          reject(err);
        });
    });
  };
  var removeAsyncRequest = function removeAsyncRequest(
    botContext,
    requestUuid
  ) {
    var DeviceStorage = botContext.getCapability('DeviceStorage');
    var key = STORAGE_KEY_PREFIX + botContext.botManifest.id;
    return new Promise(function(resolve, reject) {
      return DeviceStorage.delete(requestUuid)
        .then(function() {
          return DeviceStorage.removeArrayValue(key, requestUuid);
        })
        .then(function() {
          resolve();
        })
        .catch(function(err) {
          console.log('Error saving the request', err);
          reject(err);
        });
    });
  };
  return {
    saveAsyncRequest: saveAsyncRequest,
    getAsyncRequests: getAsyncRequests,
    removeAsyncRequest: removeAsyncRequest,
    version: '1.0.0',
  };
})();
