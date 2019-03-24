package com.frontm.frontm.proto.converters;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableMap;
import com.frontm.auth.proto.SignupResponse;
import com.frontm.user.proto.TwilioTokenResponse;

public class TwilioTokenResponseConverter {

    public WritableMap toJson(TwilioTokenResponse response) {
        WritableMap map = Arguments.createMap();
        map.putString("accessToken", response.getAccessToken());
        return map;
    }

    public WritableMap toResponse(TwilioTokenResponse response) {
        WritableMap map = Arguments.createMap();
        map.putMap("data", this.toJson(response));
        return map;
    }
}
