package com.frontm.frontm.proto.converters;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.frontm.channels.proto.DBChannel;
import com.frontm.user.proto.Contact;

public class DBChannelConverter {

    public WritableMap toJson(DBChannel channel) {
        WritableMap map = Arguments.createMap();
        map.putString("channelId", channel.getChannelId());
        map.putString("channelType", channel.getChannelType());
        map.putString("channelName", channel.getChannelName());
        map.putString("userDomain", channel.getUserDomain());
        map.putString("description", channel.getDescription());
        map.putString("discoverable", channel.getDiscoverable());
        map.putString("logo", channel.getLogo());

        map.putDouble("createdOn", channel.getCreatedOn());
        map.putBoolean("isPlatformChannel", channel.getIsPlatformChannel());
        map.putBoolean("isFavourite", channel.getIsFavourite());

        if (channel.hasChannelOwner()) {
            map.putMap("channelOwner", new ChannelOwnerConverter().toJson(channel.getChannelOwner()));
        }

        if (channel.getParticipantsCount() > 0) {
            WritableArray array = Arguments.createArray();
            for (int i = 0; i < channel.getParticipantsCount(); ++i) {
                array.pushString(channel.getParticipants(i));
            }
            map.putArray("participants", array);
        } else {
            map.putArray("participants", Arguments.createArray());
        }

        return map;
    }
}
