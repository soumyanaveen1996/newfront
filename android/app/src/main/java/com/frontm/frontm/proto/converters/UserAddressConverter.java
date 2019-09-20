package com.frontm.frontm.proto.converters;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.frontm.auth.proto.SignInUser;
import com.frontm.auth.proto.SigninResponse;
import com.frontm.commonmessages.proto.UserAddress;
import com.frontm.user.proto.Contact;

public class UserAddressConverter {

    public WritableMap toJson(UserAddress address) {
        WritableMap map = Arguments.createMap();
        map.putString("addressLine1", address.getAddressLine1());
        map.putString("addressLine2", address.getAddressLine2());
        map.putString("addressCity", address.getCity());
        map.putString("addressCountry", address.getCountry());
        map.putString("addressPostCode", address.getPostCode());
        map.putString("addressState", address.getState());

        return map;
    }
}

