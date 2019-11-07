package com.frontm.frontm.proto.converters;

import android.util.Log;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableMap;
import com.frontm.user.proto.UserBalanceResponse;

public class UserBalanceResponseConverter {
    public WritableMap toJson(UserBalanceResponse response) {
        WritableMap map = Arguments.createMap();

        map.putInt("error", response.getError());
        map.putDouble("callQuota", response.getCallQuota());

        return map;
    }

    public WritableMap toResponse(UserBalanceResponse response) {
        WritableMap map = Arguments.createMap();
        map.putMap("data", this.toJson(response));
        return map;
    }
}
