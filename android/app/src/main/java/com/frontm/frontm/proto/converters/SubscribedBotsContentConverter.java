package com.frontm.frontm.proto.converters;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.frontm.user.proto.Contact;
import com.frontm.user.proto.SubscribedBotsContent;

public class SubscribedBotsContentConverter {

    public WritableMap toJson(SubscribedBotsContent content) {
        WritableMap map = Arguments.createMap();

        if (content.getSubscribedCount() > 0) {
            WritableArray array = Arguments.createArray();
            for (int i = 0; i < content.getSubscribedCount(); ++i) {
                array.pushString(content.getSubscribed(i));
            }
            map.putArray("subscribed", array);
        } else {
            map.putArray("subscribed", Arguments.createArray());
        }

        if (content.getFavouritesCount() > 0) {
            WritableArray array = Arguments.createArray();
            for (int i = 0; i < content.getFavouritesCount(); ++i) {
                array.pushString(content.getFavourites(i));
            }
            map.putArray("favourites", array);
        } else {
            map.putArray("favourites", Arguments.createArray());
        }

        return map;
    }
}
