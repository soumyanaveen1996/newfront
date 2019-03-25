package com.frontm.frontm.proto.converters;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableMap;
import com.frontm.channels.proto.ChannelOwner;
import com.frontm.channels.proto.DBChannel;

public class ChannelOwnerConverter {

    public WritableMap toJson(ChannelOwner owner) {
        WritableMap map = Arguments.createMap();
        map.putString("userName", owner.getUserName());
        map.putString("userId", owner.getUserId());
        map.putString("emailAddress", owner.getEmailAddress());

        return map;
    }
}
