import Permissions from 'react-native-permissions';
import RemoteLogger from '../utils/remoteDebugger';

export class LocationError extends Error {
    constructor(code, message) {
        super(message);
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
    2: 'GPS is turned off'
};

export default class DeviceLocation {
    /**
     * Method to fetch the device current location
     * Returns a promise that resolves to { latitude: 'latitude',longitude: 'longitude' } on success
     */
    static getDeviceLocation = () =>
        new Promise((resolve, reject) => {
            Permissions.request('location').then(response => {
                if (response === 'authorized') {
                    RemoteLogger('Getting Location');
                    navigator.geolocation.getCurrentPosition(
                        location => {
                            console.log(
                                'Location : ',
                                JSON.stringify(location)
                            );
                            RemoteLogger('Sending Location');
                            let deviceLocation = {
                                latitude: location.coords.latitude,
                                longitude: location.coords.longitude
                            };
                            resolve(deviceLocation);
                        },
                        error => {
                            if (error.code === 2) {
                                reject(
                                    new LocationError(2, LocationErrorCodes[2])
                                );
                            }
                            reject(new LocationError(0, LocationErrorCodes[0]));
                        }
                    );
                } else {
                    reject(new LocationError(1, LocationErrorCodes[1]));
                }
            });
        });
}
