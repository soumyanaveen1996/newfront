package com.frontm.frontm.proto.converters;

import android.util.Log;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.frontm.user.proto.CallHistoryResponse;
import com.frontm.user.proto.ContactsResponse;

public class CallHistoryResponseConverter {
    public WritableMap toResponse(CallHistoryResponse response) {
        WritableMap map = Arguments.createMap();
        Log.d(">>>>>>>>>>>response", response.toString());
        return map;
    }
}
