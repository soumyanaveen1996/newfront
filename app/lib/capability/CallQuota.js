import { CallQuotaEvents, EventEmitter } from '../../lib/events';
import { DeviceStorage } from '.';
import UserServices from '../../api/UserServices';

export const UpdateCallQuota = ({ error = null, callQuota }) => {
    // Update the latest Call Quota
    if (error) {
        EventEmitter.emit(CallQuotaEvents.UPD_QUOTA_ERROR, error);
    } else {
        DeviceStorage.save(CallQuota.CURRENT_BALANCE_LOCAL_KEY, callQuota);
    }
    EventEmitter.emit(CallQuotaEvents.UPDATED_QUOTA, callQuota);
    // Maybe push it to async storage ?? - TBD
    return this;
};

export class CallQuota {
    static CURRENT_BALANCE_LOCAL_KEY = 'current_balance_local_key';

    static async getBalanceLocal() {
        try {
            let currentBalance = await DeviceStorage.get(
                this.CURRENT_BALANCE_LOCAL_KEY
            );
            if (!currentBalance) {
                currentBalance = await UserServices.getUserBalance();
            }
            return currentBalance;
        } catch (error) {
            throw new Error('Could not get the balance.');
        }
    }
}
