import Permissions from 'react-native-permissions';
import RemoteLogger from '../utils/remoteDebugger';
import Geolocation from '@react-native-community/geolocation';
import PermissionList from '../utils/PermissionList';
import { Platform } from 'react-native';
import Media from './Media';

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
            Permissions.request(PermissionList.LOCATION).then(async (response) => {
                if (response === Permissions.RESULTS.GRANTED) {
                    Geolocation.getCurrentPosition(
                        (location) => {
                            console.log(
                                'Location : ',
                                JSON.stringify(location)
                            );
                            let deviceLocation = {
                                latitude: location.coords.latitude,
                                longitude: location.coords.longitude
                            };
                            resolve(deviceLocation);
                        },
                        (error) => {
                            console.log('Location Error : ', error);
                            if (error.code === 2) {
                                //    return checkAndAskForCurrentLocation()
                                Media.alertForLocationOn();
                                reject(
                                    new LocationError(2, LocationErrorCodes[2])
                                );
                            }
                            reject(new LocationError(0, LocationErrorCodes[0]));
                        },
                        {
                            enableHighAccuracy: false,
                            timeout: 20000,
                            maximumAge: 3600000
                        }
                    );
                } else {
                    resolve(DeviceLocation.checkAndAskForCurrentLocation())
                }
            }).catch(err => {
                reject(new LocationError(1, LocationErrorCodes[1]));
            });
        });

    static checkAndAskForCurrentLocation = () =>
        new Promise(async (resolve, reject) => {
            await Media.alertForLocationPermission().then(res => {
                if (res == 'denied') {
                    reject(new LocationError(1, LocationErrorCodes[1]));
                } else {
                    let currentStatus = Midea.hasLocationPermission();
                    if (currentStatus == 'granted') {
                        Geolocation.getCurrentPosition(
                            (location) => {
                                console.log(
                                    'Location : ',
                                    JSON.stringify(location)
                                );
                                let deviceLocation = {
                                    latitude: location.coords.latitude,
                                    longitude: location.coords.longitude
                                };
                                resolve(deviceLocation);
                            },
                            (error) => {
                                console.log('Location Error : ', error);
                                if (error.code === 2) {
                                    Media.alertForLocationOn();
                                    reject(
                                        new LocationError(2, LocationErrorCodes[2])
                                    );

                                }
                                reject(new LocationError(0, LocationErrorCodes[0]));
                            },
                            {
                                enableHighAccuracy: false,
                                timeout: 20000,
                                maximumAge: 3600000
                            }
                        );
                    } else {
                        reject(new LocationError(1, LocationErrorCodes[1]));
                    }
                }
            });
        });
}
