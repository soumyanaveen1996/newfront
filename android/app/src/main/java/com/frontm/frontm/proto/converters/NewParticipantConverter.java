package com.frontm.frontm.proto.converters;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableMap;
import com.frontm.channels.proto.NewParticipant;

public class NewParticipantConverter {

    public WritableMap toJson(NewParticipant response) {
        WritableMap map = Arguments.createMap();
        map.putString("userName", response.getUserName());
        map.putString("userCompanyName", response.getUserCompanyName());
        map.putString("userId", response.getUserId());
        if (response.hasAddress()) {
            map.putMap("address", new UserAddressConverter().toJson(response.getAddress()));
        }
        return map;
    }

    public WritableMap toResponse(NewParticipant response) {
        WritableMap map = Arguments.createMap();
        map.putMap("data", this.toJson(response));
        return map;
    }
}
