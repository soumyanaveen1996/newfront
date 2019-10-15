package com.frontm.frontm.proto.converters;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.frontm.user.proto.PaginatedCallHistoryResponse;

public class PaginatedCallHistoryResponseConverter {
    public WritableMap toJson(PaginatedCallHistoryResponse response) {
        WritableMap map = Arguments.createMap();

        if (response.getRecordsCount() > 0) {
            WritableArray array = Arguments.createArray();
            for (int i = 0; i < response.getRecordsCount(); ++i) {
                array.pushMap(new CallHistoryObjectConverter().toJson(response.getRecords(i)));
            }
            map.putArray("records", array);
        } else {
            map.putArray("records", Arguments.createArray());
        }
        map.putInt("error", response.getError());
        map.putBoolean("moreRecordsExist", response.getMoreRecordsExist());

        return map;
    }

    public WritableMap toResponse(PaginatedCallHistoryResponse response) {
        WritableMap map = Arguments.createMap();
        map.putMap("data", this.toJson(response));
        return map;
    }
}
