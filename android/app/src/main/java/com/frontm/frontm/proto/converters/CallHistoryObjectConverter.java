package com.frontm.frontm.proto.converters;

import android.util.Log;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.frontm.user.proto.CallHistoryResponse;
import com.frontm.user.proto.CallHistoryObject;

public class CallHistoryObjectConverter {
    public WritableMap toJson(CallHistoryObject response) {
        WritableMap map = Arguments.createMap();

        map.putInt("callCharge", response.getCallCharge());
        map.putDouble("callTimestamp", response.getCallTimestamp());
        map.putDouble("currentBalance", response.getCurrentBalance());
        map.putInt("duration", response.getDuration());
        map.putString("userId", response.getUserId());
        map.putString("callType", response.getCallType());
        map.putString("callDirection", response.getCallDirection());
        map.putString("fromUserId", response.getFromUserId());
        map.putString("fromUserName", response.getFromUserName());
        map.putString("toNumber", response.getToNumber());
        map.putString("toUserId", response.getToUserId());
        map.putString("toUserName", response.getToUserName());

        return map;
    }
}
