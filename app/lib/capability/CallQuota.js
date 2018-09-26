import { CallQuotaEvents, EventEmitter } from '../../lib/events';
const UpdateCallQuota = ({ error = null, callQuota }) => {
    // Update the latest Call Quota
    if (error) {
        EventEmitter.emit(CallQuotaEvents.UPD_QUOTA_ERROR, { error });
    }

    EventEmitter.emit(CallQuotaEvents.UPDATED_QUOTA, {
        callQuota
    });
    // Maybe push it to async storage ?? - TBD
    return this;
};

export default UpdateCallQuota;
