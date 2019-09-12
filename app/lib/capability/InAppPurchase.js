import * as RNIap from 'react-native-iap';
import { Platform, NativeModules } from 'react-native';
import Auth from './Auth';

const UserServiceClient = NativeModules.UserServiceClient;
const PRODUCT_NAMES = {
    VOIP: 'voip',
    BOT: 'bot'
};
// export class InAppPurchaseError extends Error {
//     constructor(code, message) {
//         super();
//         this.code = code;
//         this.message = message;
//     }

//     get code() {
//         return this.code;
//     }

//     get message() {
//         return this.message;
//     }
// }

const InAppPurchaseErrorCodes = {
    0: 'Purchase failed',
    1: 'Unable to connect to App Store'
};

const connection = async () => {
    try {
        await RNIap.initConnection();

        return true;
    } catch (err) {
        return false;
    }
};

const grpcTopupUserBalance = (paymentCode, amount, token) =>
    new Promise((resolve, reject) => {
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
                    if (error) {
                        reject({
                            type: 'error',
                            error: error.code
                        });
                    } else {
                        if (result.data.error === 0) {
                            resolve(result);
                        } else {
                            reject(result.data.error);
                        }
                    }
                }
            );
        });
    });

const buyProduct = async ({
    productCode,
    productName = PRODUCT_NAMES.VOIP,
    botId = null
}) => {
    const isConnected = await connection();
    if (isConnected) {
        try {
            let itemSkus;
            if (productCode === 'bot_1000') {
                itemSkus = Platform.select({
                    ios: ['bot_2000'],
                    android: ['bot_1000']
                });
            } else {
                itemSkus = Platform.select({
                    ios: [productCode],
                    android: [productCode]
                });
            }
            const products = await RNIap.getProducts(itemSkus);
            const sku = products[0].productId;

            const purchase = await RNIap.requestPurchase(sku, false);
            return purchase;
        } catch (err) {
            console.error(err.code, err.message);
            throw new Error('Cannot buy product');
        }
    } else {
        throw new Error('Cannot connect to app store');
    }
};

const InAppPurchase = {
    PRODUCT_NAMES,
    InAppPurchaseErrorCodes,
    buyProduct,
    grpcTopupUserBalance
};

export default InAppPurchase;
