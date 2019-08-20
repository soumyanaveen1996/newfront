package com.frontm.frontm.proto.converters;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableMap;
import com.frontm.user.proto.UserDomain;

public class UserDomainConverter {

    public WritableMap toJson(UserDomain response) {
        WritableMap map = Arguments.createMap();
        map.putString("userDomain", response.getUserDomain());
        map.putString("name", response.getName());
        map.putMap("viewModes", new DomainViewModeConverter().toJson(response.getViewModes()));
        map.putString("logoUrl", response.getLogoUrl());
        map.putBoolean("lastLoggedIn", response.getLastLoggedIn());

        return map;
    }
}
