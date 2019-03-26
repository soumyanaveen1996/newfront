package com.frontm.frontm.proto.converters;

import android.util.Log;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableMap;
import com.frontm.conversation.proto.GetArchivedMessagesContent;
import com.frontm.frontm.proto.JsonConvert;
import com.frontm.queue.proto.QueueMessage;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

public class GetArchivedMessagesContentConverter {

    public WritableMap toJson(GetArchivedMessagesContent message) {
        WritableMap map = Arguments.createMap();
        map.putString("messageId", message.getMessageId());
        map.putString("contentType",message.getContentType());
        map.putDouble("createdOn", message.getCreatedOn());
        map.putString("createdBy", message.getCreatedBy());

        try {
            JSONObject json = new JSONObject(message.getContent().toStringUtf8());
            map.putMap("content", JsonConvert.jsonToReact(json));
        } catch (JSONException e) {
            Log.d("GRPC:::Error", e.getStackTrace().toString());
            return null;
        }

        try {
            JSONObject json = new JSONObject(message.getOptions().toStringUtf8());
            map.putMap("options", JsonConvert.jsonToReact(json));
        } catch (JSONException e) {
            Log.d("GRPC:::Error", e.getStackTrace().toString());
        }

        return map;
    }

}


