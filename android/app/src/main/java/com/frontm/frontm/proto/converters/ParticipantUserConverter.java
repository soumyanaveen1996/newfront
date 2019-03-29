package com.frontm.frontm.proto.converters;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.frontm.channels.proto.ParticpantUser;

public class ParticipantUserConverter {

    public WritableMap toJson(ParticpantUser user) {
        WritableMap map = Arguments.createMap();
        map.putString("userId", user.getUserId());
        map.putString("userName", user.getUserName());
        map.putString("role", user.getRole());

        return map;
    }
}
