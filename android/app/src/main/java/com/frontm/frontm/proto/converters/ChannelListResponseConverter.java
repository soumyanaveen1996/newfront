package com.frontm.frontm.proto.converters;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.frontm.channels.proto.ChannelListResponse;
import com.frontm.user.proto.ContactsResponse;

public class ChannelListResponseConverter {

    public WritableMap toJson(ChannelListResponse response) {
        WritableMap map = Arguments.createMap();

        map.putInt("error", response.getError());
        if (response.getContentCount() > 0) {
            WritableArray array = Arguments.createArray();
            for (int i = 0; i < response.getContentCount(); ++i) {
                array.pushMap(new DBChannelConverter().toJson(response.getContent(i)));
            }
            map.putArray("content", array);
        } else {
            map.putArray("content", Arguments.createArray());
        }

        return map;
    }


    public WritableMap toResponse(ChannelListResponse response) {
        WritableMap map = Arguments.createMap();
        map.putMap("data", this.toJson(response));
        return map;
    }
}
