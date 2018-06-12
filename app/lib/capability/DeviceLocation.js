import Permissions from 'react-native-permissions';

export class LocationError extends Error {
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

export const LocationErrorCodes = {
    0: 'Error in getting location',
    1: 'User rejected location permissions',
}

export default class DeviceLocation {

    /**
     * Method to fetch the device current location
     * Returns a promise that resolves to { latitude: 'latitude',longitude: 'longitude' } on success
    */
    static getDeviceLocation = () => new Promise((resolve, reject) => {
        Permissions.request('location')
            .then((response) => {
                if (response === 'authorized') {
                    navigator.geolocation.getCurrentPosition((location) => {
                        console.log('Location : ', JSON.stringify(location));
                        let deviceLocation = {
                            latitude: location.coords.latitude,
                            longitude: location.coords.longitude
                        };
                        resolve(deviceLocation);
                    }, (error) => {
                        reject(new LocationErrorCodes(0, LocationErrorCodes[0]));
                    });
                } else {
                    reject(new LocationErrorCodes(1, LocationErrorCodes[1]));
                }
            });

    });
}
