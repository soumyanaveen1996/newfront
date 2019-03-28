package com.frontm.frontm.proto.converters;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.frontm.user.proto.UpdateUserProfileResponse;
import com.frontm.user.proto.User;

public class UpdateUserProfileResponseConverter {

    public WritableMap toJson(UpdateUserProfileResponse response) {
        WritableMap map = Arguments.createMap();
        map.putInt("error", response.getError());

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

    public WritableMap toResponse(UpdateUserProfileResponse response) {
        WritableMap map = Arguments.createMap();
        map.putMap("data", this.toJson(response));
        return map;
    }
}