import { Platform } from 'react-native';
import configToUse from '../config/config';
import apiClient from './Api';
import { getBaseParams } from './BaseParams';

export default class AgentGuardService {
    // rpc Execute(AgentGuardInput) returns (AgentGuardStringResponse) {}
    static execute = (params) => {
        return apiClient().post('agentguard.AgentGuardService/Execute', {
            ...params,
            ...getBaseParams()
        });
    };
}
