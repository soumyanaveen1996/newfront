package com.frontm.frontm.proto.converters;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableArray;
import com.frontm.channels.proto.FindNewParticipantsResponse;

public class FindNewParticipantsResponseConverter {

    public WritableMap toJson(FindNewParticipantsResponse response) {
        WritableMap map = Arguments.createMap();
        map.putInt("error", response.getError());
        map.putString("errorMessage", response.getErrorMessage());
        if (response.getContentCount() > 0) {
            WritableArray array = Arguments.createArray();
            for (int i = 0; i < response.getContentCount(); ++i) {
                array.pushMap(new NewParticipantConverter().toJson(response.getContent(i)));
            }
            map.putArray("content", array);
        } else {
            map.putArray("content", Arguments.createArray());
        }
        return map;
    }

    public WritableMap toResponse(FindNewParticipantsResponse response) {
        WritableMap map = Arguments.createMap();
        map.putMap("data", this.toJson(response));
        return map;
    }
}