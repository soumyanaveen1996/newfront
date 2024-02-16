//rpc AddLogEntry(LogEntryInput) returns (commonmessages.Empty) {}

import apiClient from './Api';
import { getBaseParams } from './BaseParams';

export default class UtilsService {
    static addLogEntry = (logData) => {
        return apiClient().post('utils.UtilsService/AddLogEntry', {
            ...getBaseParams(),
            ...logData
        });
    };
}
