package com.frontm.frontm.proto.converters;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.frontm.contacts.proto.MatchedUser;
import com.frontm.frontm.proto.JsonConvert;
import com.frontm.queue.proto.QueueMessage;
import com.frontm.queue.proto.QueueResponse;

import org.json.JSONException;
import org.json.JSONObject;

public class QueueResponseConverter {

    public WritableMap toJson(QueueResponse response) {

        WritableMap map = Arguments.createMap();
        map.putString("error", response.getError());
        map.putString("errorMessage", response.getErrorMessage());

        if (response.getQueueMsgsCount() > 0) {
            WritableArray array = Arguments.createArray();
            for (int i = 0; i < response.getQueueMsgsCount(); ++i) {
                QueueMessage message = response.getQueueMsgs(i);
                array.pushMap(new QueueMessageConverter().toJson(message));
            }
            map.putArray("queueMsgs", array);
        } else {
            map.putArray("queueMsgs", Arguments.createArray());
        }

        return map;
    }

    public WritableMap toResponse(QueueResponse response) {
        WritableMap map = Arguments.createMap();
        map.putMap("data", this.toJson(response));
        return map;
    }
}


