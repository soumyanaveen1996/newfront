import { CallQuotaEvents, EventEmitter } from '../../lib/events';
export const updateCallQuota = ({ error = null, callQuota }) => {
    // Update the latest Call Quota
    if (error) {
        EventEmitter.emit(CallQuotaEvents.UPD_QUOTA_ERROR, { error });
    }

    EventEmitter.emit(CallQuotaEvents.UPDATED_QUOTA, {
        callQuota
    });
    // Maybe push it to async storage ?? - TBD
};
