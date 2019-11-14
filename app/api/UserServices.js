import { Auth, DeviceStorage, CallQuota } from '../lib/capability';
import { NativeModules, Platform } from 'react-native';

const UserServiceClient = NativeModules.UserServiceClient;

export default class UserServices {
    static topupUserBalance(paymentCode, amount, token) {
        return new Promise((resolve, reject) => {
            Auth.getUser().then(user => {
                console.log('GRPC ::::: MONEY FOR FRONTM $_$');
                const platform = Platform.OS;
                return UserServiceClient.topupUserBalance(
                    user.creds.sessionId,
                    {
                        paymentCode,
                        amount,
                        token,
                        platform
                    },
                    (error, result) => {
                        console.log('GRPC:::topupUserBalance', error, result);
                        if (error) {
                            reject({
                                type: 'error',
                                error: error.code
                            });
                        } else {
                            if (result.data.error === 0) {
                                DeviceStorage.save(
                                    CallQuota.CURRENT_BALANCE_LOCAL_KEY,
                                    result.data.callQuota
                                );
                                resolve(result.data.callQuota);
                            } else {
                                reject(result.data.error);
                            }
                        }
                    }
                );
            });
        });
    }

    static getUserBalance() {
        return new Promise((resolve, reject) => {
            Auth.getUser().then(user => {
                return UserServiceClient.getUserBalance(
                    user.creds.sessionId,
                    (error, result) => {
                        if (error) {
                            reject({
                                type: 'error',
                                error: error.code
                            });
                        } else {
                            if (result.data.error === 0) {
                                DeviceStorage.save(
                                    CallQuota.CURRENT_BALANCE_LOCAL_KEY,
                                    result.data.callQuota
                                );
                                resolve(result.data.callQuota);
                            } else {
                                reject(result.data.error);
                            }
                        }
                    }
                );
            });
        });
    }
}
