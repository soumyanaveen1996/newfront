package com.frontm.frontm.proto.converters;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.frontm.auth.proto.SignInUser;
import com.frontm.user.proto.User;

public class SignInUserConverter {

    public WritableMap toJson(SignInUser user) {
        WritableMap map = Arguments.createMap();
        map.putString("userName", user.getUserName());
        map.putString("emailAddress", user.getEmailAddress());
        map.putString("userId", user.getUserId());
        map.putBoolean("visible", user.getVisible());
        map.putBoolean("searchable", user.getSearchable());
        map.putBoolean("archiveMessages", user.getArchiveMessages());
        if (user.hasPhoneNumbers()) {
            map.putMap("phoneNumbers", new PhoneNumbersConverter().toJson(user.getPhoneNumbers()));
        }

        if (user.getDomainsCount() > 0) {
            WritableArray array = Arguments.createArray();
            for (int i = 0; i < user.getDomainsCount(); ++i) {
                array.pushMap(new DomainRolesConverter().toJson(user.getDomains(i)));
            }
            map.putArray("domains", array);
        } else {
            map.putArray("domains", Arguments.createArray());
        }
        return map;
    }

    public WritableMap toResponse(SignInUser user) {
        WritableMap map = Arguments.createMap();
        map.putMap("data", this.toJson(user));
        return map;
    }
}
