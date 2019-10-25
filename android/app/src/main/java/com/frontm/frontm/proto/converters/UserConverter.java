package com.frontm.frontm.proto.converters;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableMap;
import com.frontm.user.proto.User;

public class UserConverter {

    public WritableMap toJson(User user) {
        WritableMap map = Arguments.createMap();
        map.putString("userName", user.getUserName());
        map.putString("emailAddress", user.getEmailAddress());
        map.putString("userTimezone", user.getUserTimezone());
        map.putString("userCompanyName", user.getUserCompanyName());
        map.putString("userId", user.getUserId());
        map.putString("companyId", user.getCompanyId());
        map.putBoolean("visible", user.getVisible());
        map.putBoolean("searchable", user.getSearchable());
        if (user.hasPhoneNumbers()) {
            map.putMap("phoneNumbers", new PhoneNumbersConverter().toJson(user.getPhoneNumbers()));
        }
        if (user.hasAddress()) {
            map.putMap("address", new UserAddressConverter().toJson(user.getAddress()));
        }
        return map;
    }

    public WritableMap toResponse(User user) {
        WritableMap map = Arguments.createMap();
        map.putMap("data", this.toJson(user));
        return map;
    }
}
