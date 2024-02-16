import apiClient from './Api';
import { getBaseParams } from './BaseParams';

export default class QueueService {
    // rpc GetSampleMessages (commonmessages.Empty) returns (stream MessageList) {}
    static getSampleMessages = () => {
        return apiClient().post('queue.QueueService/GetSampleMessages', {
            ...getBaseParams()
        });
    };

    // rpc GetSampleStreamingMessages (commonmessages.Empty) returns (stream Message) {}
    static getSampleStreamingMessages = () => {
        return apiClient().post(
            'queue.QueueService/GetSampleStreamingMessages',
            {
                ...getBaseParams()
            }
        );
    };

    //     rpc GetSampleBufferedMessage (commonmessages.Empty) returns (stream BufferMessage) {}
    static getSampleBufferedMessage = () => {
        return apiClient().post('queue.QueueService/GetSampleBufferedMessage', {
            ...getBaseParams()
        });
    };

    // rpc GetPaginatedQueueMessages (QueueMessageInput) returns (QueueResponseList) {}
    static getPaginatedQueueMessages = (startTime) => {
        return apiClient().post(
            'queue.QueueService/GetPaginatedQueueMessages',
            {
                ...getBaseParams(),
                ...{ startTime: startTime }
            }
        );
    };

    //     rpc GetAllQueueMessages (commonmessages.Empty) returns (stream QueueResponse) {}
    static getAllQueueMessages = () => {
        return apiClient().post('queue.QueueService/GetAllQueueMessages', {
            ...getBaseParams()
        });
    };

    //     rpc GetStreamingQueueMessage (commonmessages.Empty) returns (stream QueueMessage) {}
    static getStreamingQueueMessage = () => {
        return apiClient().post('queue.QueueService/GetStreamingQueueMessage', {
            ...getBaseParams()
        });
    };
}
