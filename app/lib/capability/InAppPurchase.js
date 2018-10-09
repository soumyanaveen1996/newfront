import * as RNIap from 'react-native-iap';
import { Platform } from 'react-native';

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
        console.log('In InAppPurchase');

        await RNIap.initConnection();
        console.log('Connected to PlayStore!!!');

        return true;
    } catch (err) {
        console.log('Error : ' + err.message);
        return false;
    }
};

const buyProduct = async ({
    productCode,
    productName = PRODUCT_NAMES.VOIP,
    botId = null
}) => {
    const isConnected = await connection();
    if (isConnected) {
        try {
            // const sku = 'android.test.purchased';
            // const sku = 'android.test.canceled';
            // const sku = 'android.test.item_unavailable';
            // const sku = productCode;
            const itemSkus = Platform.select({
                ios: ['bot_2000'],
                android: ['bot_1000']
            });
            const Products = await RNIap.getProducts(itemSkus);
            console.log(Products);
            // throw new Error("Debugging")

            const purchase = await RNIap.buyProductWithoutFinishTransaction(
                Products[0].productId
            );
            // const purchase = await RNIap.buyProduct(sku);
            console.log(`Purchase : ${purchase}`);
            /**
                 *
autoRenewingAndroid: false
dataAndroid: "{"packageName":"com.frontm.frontm","orderId":"transactionId.android.test.purchased","productId":"android.test.purchased","developerPayload":"","purchaseTime":0,"purchaseState":0,"purchaseToken":"inapp:com.frontm.frontm:android.test.purchased"}"
productId: "android.test.purchased"
purchaseToken: "inapp:com.frontm.frontm:android.test.purchased"
signatureAndroid: ""
transactionDate: "0"
transactionId: "transactionId.android.test.purchased"
transactionReceipt: "inapp:com.frontm.frontm:android.test.purchased"
                 *
                 */
            // Update the server with the purchase details;

            // Reset Purchase so that it can be purchased again
            RNIap.finishTransaction();
            await RNIap.consumePurchase(purchase.purchaseToken);
            console.log('Finished Everything Send Back data');

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
    buyProduct
};

export default InAppPurchase;
