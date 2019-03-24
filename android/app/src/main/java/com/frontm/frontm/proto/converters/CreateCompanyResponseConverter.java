package com.frontm.frontm.proto.converters;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableMap;
import com.frontm.company.proto.CreateCompanyResponse;
import com.frontm.user.proto.VoipToggleResponse;

public class CreateCompanyResponseConverter {

    public WritableMap toJson(CreateCompanyResponse response) {
        WritableMap map = Arguments.createMap();
        map.putBoolean("success", response.getSuccess());
        return map;
    }

    public WritableMap toResponse(CreateCompanyResponse response) {
        WritableMap map = Arguments.createMap();
        map.putBoolean("success", response.getSuccess());
        map.putMap("data", this.toJson(response));
        return map;
    }
}
