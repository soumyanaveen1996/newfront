package com.frontm.frontm.proto.converters;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.frontm.user.proto.BotSubscriptionsResponse;
import com.frontm.user.proto.ContactsResponse;

public class BotSubscriptionsResponseConverter {

    public WritableMap toJson(BotSubscriptionsResponse response) {
        WritableMap map = Arguments.createMap();

        map.putInt("error", response.getError());
        if (response.hasContent()) {
            map.putMap("content", new SubscribedBotsContentConverter().toJson(response.getContent()));
        }

        return map;
    }


    public WritableMap toResponse(BotSubscriptionsResponse response) {
        WritableMap map = Arguments.createMap();
        map.putInt("error", response.getError());
        map.putMap("data", this.toJson(response));
        return map;
    }
}
