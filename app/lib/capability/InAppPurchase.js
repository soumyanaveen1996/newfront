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

            const Products = await RNIap.getProducts(itemSkus);
            // throw new Error("Debugging")
            const sku = Products[0].productId;
            let purchase;
            if (Platform.OS === 'ios') {
                purchase = await RNIap.buyProductWithoutFinishTransaction(sku);
                RNIap.finishTransaction();
            } else {
                purchase = await RNIap.buyProduct(sku);
                await RNIap.consumePurchase(purchase.purchaseToken);
            }
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
