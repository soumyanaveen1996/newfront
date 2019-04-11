package com.frontm.frontm.proto.converters;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableMap;
import com.frontm.commonmessages.proto.EmailAddresses;

public class EmailAddressesConverter {

    public WritableMap toJson(EmailAddresses response) {
        WritableMap map = Arguments.createMap();
        map.putString("home", response.getHome());
        map.putString("work", response.getWork());
        return map;
    }
}
