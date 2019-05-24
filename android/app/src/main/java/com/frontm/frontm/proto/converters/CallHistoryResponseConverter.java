package com.frontm.frontm.proto.converters;

import android.util.Log;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.frontm.user.proto.CallHistoryResponse;
import com.frontm.user.proto.CallHistoryObject;

public class CallHistoryResponseConverter {
    public WritableMap toJson(CallHistoryResponse response) {
        WritableMap map = Arguments.createMap();

        if (response.getContentCount() > 0) {
            WritableArray array = Arguments.createArray();
            for (int i = 0; i < response.getContentCount(); ++i) {
                array.pushMap(new CallHistoryObjectConverter().toJson(response.getContent(i)));
            }
            map.putArray("content", array);
        } else {
            map.putArray("content", Arguments.createArray());
        }

        return map;
    }

    public WritableMap toResponse(CallHistoryResponse response) {
        WritableMap map = Arguments.createMap();
        map.putMap("data", this.toJson(response));
        return map;
    }
}
