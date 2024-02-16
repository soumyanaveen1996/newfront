//rpc Ping(commonmessages.Empty) returns (PingReply) {}

import apiClient from './Api';
import { getBaseParams } from './BaseParams';

export default class AuthService {
    static ping = () => {
        return apiClient().post('ping.PingService/Ping', {
            ...getBaseParams()
        });
    };
}
