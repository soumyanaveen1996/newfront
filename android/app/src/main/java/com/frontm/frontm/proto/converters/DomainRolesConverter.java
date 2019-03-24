package com.frontm.frontm.proto.converters;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.frontm.commonmessages.proto.DomainRoles;
import com.frontm.commonmessages.proto.PhoneNumbers;

public class DomainRolesConverter {

    public WritableMap toJson(DomainRoles response) {
        WritableMap map = Arguments.createMap();
        map.putString("domain", response.getDomain());

        if (response.getRolesCount() > 0) {
            WritableArray array = Arguments.createArray();
            for (int i = 0; i < response.getRolesCount(); ++i) {
                array.pushString(response.getRoles(i));
            }
            map.putArray("roles", array);
        } else {
            map.putArray("roles", Arguments.createArray());
        }
        return map;
    }
}
