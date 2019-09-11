package com.frontm.frontm.proto.converters;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.frontm.user.proto.SubscribeDomainResponse;

public class SubscribeDomainResponseConverter {

    public WritableMap toJson(SubscribeDomainResponse response) {
        WritableMap map = Arguments.createMap();
        map.putInt("error", response.getError());

        if (response.getContentCount() > 0) {
            WritableArray array = Arguments.createArray();
            for (int i = 0; i < response.getContentCount(); ++i) {
                array.pushMap(new UserDomainConverter().toJson(response.getContent(i)));
            }
            map.putArray("content", array);
        } else {
            map.putArray("content", Arguments.createArray());
        }
        return map;
    }

    public WritableMap toResponse(SubscribeDomainResponse response) {
        WritableMap map = Arguments.createMap();
        map.putInt("error", response.getError());
        map.putMap("data", this.toJson(response));
        return map;
    }
}
