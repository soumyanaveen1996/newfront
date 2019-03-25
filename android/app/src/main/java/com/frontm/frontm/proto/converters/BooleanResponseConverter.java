package com.frontm.frontm.proto.converters;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.frontm.channels.proto.BooleanResponse;
import com.frontm.channels.proto.ChannelListResponse;
import com.frontm.channels.proto.DBChannel;

public class BooleanResponseConverter {

    public WritableMap toJson(BooleanResponse response) {
        WritableMap map = Arguments.createMap();
        map.putInt("error", response.getError());
        map.putString("errorMessage", response.getErrorMessage());

        if (response.getContentCount() > 0) {
            WritableArray array = Arguments.createArray();
            for (int i = 0; i < response.getContentCount(); ++i) {
                array.pushBoolean(response.getContent(i));
            }
            map.putArray("content", array);
        } else {
            map.putArray("content", Arguments.createArray());
        }

        return map;
    }

    public WritableMap toResponse(BooleanResponse response) {
        WritableMap map = Arguments.createMap();
        map.putInt("error", response.getError());
        map.putString("errorMessage", response.getErrorMessage());
        map.putMap("data", this.toJson(response));
        return map;
    }
}
