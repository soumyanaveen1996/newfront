import * as RNIap from 'react-native-iap';
import { Platform } from 'react-native';
import { CallQuota, DeviceStorage } from '.';
import UserServices from '../../apiV2/UserServices';
import EventEmitter, { CallQuotaEvents } from '../events';
import { Toast } from 'react-native-toast-message/lib/src/Toast';

const R = require('ramda');

var emitter = require('tiny-emitter/instance');

let listener;
let errorListener;

export class PurchaseManager {
    static subscribe() {
        if (!listener) {
            listener = RNIap.purchaseUpdatedListener(
                this.purchaseHandler.bind(this)
            );
        }
        if (!errorListener) {
            errorListener = RNIap.purchaseErrorListener(
                this.purchaseErrorHandler.bind(this)
            );
        }
    }

    static async unsubscribe() {
        if (listener) {
            listener.remove();
        }
        if (errorListener) {
            errorListener.remove();
        }
        emitter.off();
    }

    static async purchaseHandler(purchase) {
        const receipt = purchase.transactionReceipt;
        if (receipt) {
            // if (Platform.OS === 'ios') {
            //     RNIap.finishTransactionIOS(purchase.transactionId);
            //     // RNIap.clearTransactionIOS();
            // } else if (Platform.OS === 'android') {
            //     RNIap.consumePurchaseAndroid(purchase.purchaseToken);
            //     RNIap.consumeAllItemsAndroid();
            // }
            if (
                purchase.productId ===
                InAppPurchase.ProductCodes.Voip.BALANCE_4_99
            ) {
                this.topup(4.99, purchase);
            } else if (
                purchase.productId ===
                InAppPurchase.ProductCodes.Voip.BALANCE_9_99
            ) {
                this.topup(9.99, purchase);
            } else if (
                purchase.productId ===
                InAppPurchase.ProductCodes.Voip.BALANCE_49_99
            ) {
                this.topup(49.99, purchase);
            } else if (
                purchase.productId ===
                InAppPurchase.ProductCodes.Voip.BALANCE_99_99
            ) {
                this.topup(99.99, purchase);
            }
            emitter.emit('purchased', purchase);
            RNIap.finishTransaction(purchase, true)
                .then(() => {
                    RNIap.endConnection();
                })
                .catch((e) => {
                    Toast.show({ text1: 'error in purchase' });
                    console.log('Error in consumtin', e);
                });
        }
    }

    static async purchaseErrorHandler(error) {
        if (error.code == 'E_USER_CANCELLED') {
            // cancelled event is handdled here with trigger function in app purchase
            EventEmitter.emit(
                CallQuotaEvents.USER_PURCHASE_CANCELLED,
                error.message
            );
        }
        emitter.emit('purchase_fail', null);
    }

    static async topup(amount, purchase) {
        try {
            UserServices.topupUserBalance({
                paymentCode: '100',
                amount,
                token: 'sampleToken'
            }).then((result) => {
                if (result.succsses || result.error === 0) {
                    EventEmitter.emit(
                        CallQuotaEvents.UPDATED_QUOTA,
                        result.callQuota
                    );
                    if (result.error === 0) {
                        DeviceStorage.save(
                            CallQuota.CURRENT_BALANCE_LOCAL_KEY,
                            result.callQuota
                        );
                    }
                }
            });
        } catch (error) {
            Toast.show({ text1: 'Error in topUp' });
            EventEmitter.emit(CallQuotaEvents.UPD_QUOTA_ERROR, error);
        }
    }
}

export class InAppPurchase {
    static ProductTypes = {
        VOIP: 'voip',
        BOT: 'bot'
    };

    static ProductCodes = {
        Voip: {
            BALANCE_4_99: 'onship_balance_4_99',
            BALANCE_9_99: 'onship_balance_9_99',
            BALANCE_49_99: 'onship_balance_49_99',
            BALANCE_99_99: 'onship_balance_99_99'
        }
    };

    static async buyProduct({
        productCode,
        productName = this.ProductTypes.VOIP,
        botId = null
    }) {
        // try {
        //     await RNIap.initConnection();
        // } catch (err) {
        //     console.log('Purchase ERROR:', err);
        //     throw new Error('Cannot connect to app store');
        // }
        try {
            PurchaseManager.subscribe();
            let itemSkus;
            if (productCode === 'postcard_2_99' && Platform.OS === 'android') {
                productCode = 'onship_postcard_2_99';
            }
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

            RNIap.initConnection()
                .then(async () => {
                    //consume all available purchases in case anything left due to error
                    const purchases = await RNIap.getAvailablePurchases();
                    purchases.forEach(async (purchase) => {
                        await RNIap.finishTransaction(purchase, true);
                    });
                    RNIap.getProducts(itemSkus)
                        .then((products) => {
                            const product_selected = R.find(
                                R.propEq('productId', productCode)
                            )(products);
                            if (!product_selected) {
                                throw new Error('Invalid Product!');
                            }
                            const sku = product_selected.productId;
                            RNIap.requestPurchase(sku, false);
                            return new Promise((resolve, reject) => {
                                emitter.on('purchased', (purchase) => {
                                    setTimeout(() => {
                                        resolve(purchase);
                                    }, 3000);
                                });
                                emitter.on('purchase_fail', () => reject());
                            });
                        })
                        .catch((err) => {
                            throw new Error('Cannot retieve product details');
                        });
                })
                .catch(function (err) {
                    throw new Error('Cannot initiale connection');
                });
        } catch (err) {
            console.log('Purchase ERROR:', err);
            throw new Error('Cannot buy product');
        }
    }
}
