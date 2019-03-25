package com.frontm.frontm.proto.converters;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.frontm.contacts.proto.AgentGuardBoolResponse;
import com.frontm.contacts.proto.FindResponse;
import com.frontm.contacts.proto.MatchedUser;

public class FindResponseConverter {

    public WritableMap toJson(FindResponse response) {
        WritableMap map = Arguments.createMap();
        map.putInt("error", response.getError());
        map.putString("errorMessage", response.getErrorMessage());

        if (response.getContentCount() > 0) {
            WritableArray array = Arguments.createArray();
            for (int i = 0; i < response.getContentCount(); ++i) {
                MatchedUser user = response.getContent(i);
                WritableMap m = Arguments.createMap();
                m.putString("userId", user.getUserId());
                m.putString("userName", user.getUserId());

                array.pushMap(m);
            }
            map.putArray("content", array);
        } else {
            map.putArray("content", Arguments.createArray());
        }

        return map;
    }

    public WritableMap toResponse(FindResponse response) {
        WritableMap map = Arguments.createMap();
        map.putInt("error", response.getError());
        map.putString("errorMessage", response.getErrorMessage());
        map.putMap("data", this.toJson(response));
        return map;
    }
}
