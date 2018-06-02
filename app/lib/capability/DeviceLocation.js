
export default class DeviceLocation {

    /**
     * Method to fetch the device current location
     * Returns a promise that resolves to { latitude: 'latitude',longitude: 'longitude' } on success
    */
    static getDeviceLocation = () => new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition((location) => {
            console.log('Location : ', JSON.stringify(location));
            let deviceLocation = {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude
            };
            resolve(deviceLocation);
        }, (error) => {
            console.log('error in geolocation : ', error);
            reject(error);
        });
    });

}