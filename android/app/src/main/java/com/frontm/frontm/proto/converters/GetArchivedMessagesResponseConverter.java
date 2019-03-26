package com.frontm.frontm.proto.converters;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.frontm.conversation.proto.GetArchivedMessagesContent;
import com.frontm.conversation.proto.GetArchivedMessagesResponse;
import com.frontm.queue.proto.QueueMessage;
import com.frontm.queue.proto.QueueResponse;

public class GetArchivedMessagesResponseConverter {

    public WritableMap toJson(GetArchivedMessagesResponse response) {

        WritableMap map = Arguments.createMap();

        if (response.getContentCount() > 0) {
            WritableArray array = Arguments.createArray();
            for (int i = 0; i < response.getContentCount(); ++i) {
                GetArchivedMessagesContent content = response.getContent(i);
                array.pushMap(new GetArchivedMessagesContentConverter().toJson(content));
            }
            map.putArray("content", array);
        } else {
            map.putArray("content", Arguments.createArray());
        }
        return map;
    }

    public WritableMap toResponse(GetArchivedMessagesResponse response) {
        WritableMap map = Arguments.createMap();
        map.putMap("data", this.toJson(response));
        return map;
    }
}


