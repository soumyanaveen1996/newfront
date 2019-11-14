import * as RNIap from 'react-native-iap';
import { Platform, NativeModules, Alert } from 'react-native';
import Auth from './Auth';
import { DeviceStorage } from '.';
import UserServices from '../../api/UserServices';
import EventEmitter, { CallQuotaEvents } from '../events';

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
    }

    static async purchaseHandler(purchase) {
        const receipt = purchase.transactionReceipt;
        if (receipt) {
            if (Platform.OS === 'ios') {
                RNIap.finishTransactionIOS(purchase.transactionId);
                RNIap.clearTransactionIOS();
            } else if (Platform.OS === 'android') {
                RNIap.consumeAllItemsAndroid();
                RNIap.acknowledgePurchaseAndroid(purchase.purchaseToken);
            }
            if (
                purchase.productId ===
                InAppPurchase.ProductCodes.Voip.BALANCE_4_99
            ) {
                this.topup(4.99);
            } else if (
                purchase.productId ===
                InAppPurchase.ProductCodes.Voip.BALANCE_9_99
            ) {
                this.topup(9.99);
            } else if (
                purchase.productId ===
                InAppPurchase.ProductCodes.Voip.BALANCE_49_99
            ) {
                this.topup(49.99);
            } else if (
                purchase.productId ===
                InAppPurchase.ProductCodes.Voip.BALANCE_99_99
            ) {
                this.topup(99.99);
            }
        }
    }

    static async purchaseErrorHandler(error) {
        Alert.alert('ERROR', error.message);
    }

    static async topup(amount) {
        try {
            const newBalance = await UserServices.topupUserBalance(
                '100',
                amount,
                'sampleToken'
            );
            EventEmitter.emit(CallQuotaEvents.UPDATED_QUOTA, newBalance);
        } catch (error) {
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
            BALANCE_4_99: 'balance_4_99',
            BALANCE_9_99: 'balance_9_99',
            BALANCE_49_99: 'balance_49_99',
            BALANCE_99_99: 'balance_49_99'
        }
    };

    static async buyProduct({
        productCode,
        productName = this.ProductTypes.VOIP,
        botId = null
    }) {
        try {
            await RNIap.initConnection();
        } catch (err) {
            console.log('Purchase ERROR:', err);
            throw new Error('Cannot connect to app store');
        }
        try {
            PurchaseManager.subscribe();
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
            if (Platform.OS === 'ios') {
                RNIap.clearTransactionIOS();
            } else if (Platform.OS === 'android') {
                await RNIap.consumeAllItemsAndroid();
            }
            const products = await RNIap.getProducts(itemSkus);
            const sku = products[0].productId;

            const purchase = await RNIap.requestPurchase(sku, false);
            return purchase;
        } catch (err) {
            console.log('Purchase ERROR:', err);
            throw new Error('Cannot buy product');
        }
    }
}
