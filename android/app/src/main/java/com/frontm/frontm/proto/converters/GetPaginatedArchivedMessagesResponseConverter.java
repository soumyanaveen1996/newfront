package com.frontm.frontm.proto.converters;

import android.util.Log;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.frontm.conversation.proto.GetArchivedMessagesContent;
import com.frontm.conversation.proto.GetPaginatedArchivedMessagesResponse;
import com.frontm.frontm.proto.converters.GetArchivedMessagesContentConverter;
import com.frontm.queue.proto.QueueMessage;
import com.frontm.queue.proto.QueueResponse;

public class GetPaginatedArchivedMessagesResponseConverter {

    public WritableMap toJson(GetPaginatedArchivedMessagesResponse response) {
        Log.d(">>>>>>>>>>", "1");
        WritableMap map = Arguments.createMap();
        Log.d(">>>>>>>>>>", "2");
        if (response.getContentCount() > 0) {
            Log.d(">>>>>>>>>>", "3");
            WritableArray array = Arguments.createArray();
            for (int i = 0; i < response.getContentCount(); ++i) {
                GetArchivedMessagesContent content = response.getContent(i);
                Log.d(">>>>>>>>>>", "4");
                array.pushMap(new GetArchivedMessagesContentConverter().toJson(content));
            }
            map.putArray("content", array);
        } else {
            map.putArray("content", Arguments.createArray());
        }
        map.putInt("error", response.getError());
        map.putBoolean("moreMessagesExist", response.getMoreMessagesExist());
        Log.d(">>>>>>>>>>", "5");
        return map;
    }

    public WritableMap toResponse(GetPaginatedArchivedMessagesResponse response) {
        WritableMap map = Arguments.createMap();
        map.putMap("data", this.toJson(response));
        return map;
    }
}


