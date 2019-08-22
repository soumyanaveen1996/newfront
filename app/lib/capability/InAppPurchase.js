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
        await RNIap.initConnection();

        return true;
    } catch (err) {
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

            console.log('>>>>>>>1', itemSkus);
            const Products = await RNIap.getProducts(itemSkus);
            // throw new Error("Debugging")
            console.log('>>>>>>>2', Products);
            const sku = Products[0].productId;
            let purchase;
            if (Platform.OS === 'ios') {
                console.log('>>>>>>>3', sku);
                purchase = await RNIap.buyProductWithoutFinishTransaction(sku);
                console.log('>>>>>>>4', purchase);
                RNIap.finishTransaction();
                console.log('>>>>>>>5');
            } else {
                console.log('>>>>>>>3', sku);
                purchase = await RNIap.buyProduct(sku);
                console.log('>>>>>>>4', purchase);
                await RNIap.consumePurchase(purchase.purchaseToken);
                console.log('>>>>>>>5');
            }
            return purchase;
        } catch (err) {
            console.log('>>>>>>>rrorint', err);
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
