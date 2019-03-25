package com.frontm.frontm.proto.converters;

import android.util.Log;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.frontm.auth.proto.SignupResponse;
import com.frontm.channels.proto.DBChannel;
import com.frontm.frontm.proto.JsonConvert;
import com.frontm.queue.proto.QueueMessage;
import com.google.gson.Gson;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.nio.charset.Charset;

public class QueueMessageConverter {

    public WritableMap toJson(QueueMessage message) {
        WritableMap map = Arguments.createMap();
        map.putString("userId", message.getUserId());
        map.putString("conversation",message.getConversation());
        map.putString("bot", message.getBot());
        map.putInt("createdOn", message.getCreatedOn());
        map.putInt("contentType", message.getContentType());
        map.putString("createdBy", message.getCreatedBy());
        map.putString("messageId", message.getMessageId());
        map.putString("requestUuid", message.getRequestUuid());
        map.putString("error", message.getError());
        map.putString("detailsString", message.getDetails().toStringUtf8());

        try {
            JSONArray json = new JSONArray(message.getDetails().toStringUtf8());
            map.putArray("details", JsonConvert.jsonToReact(json));
        } catch (JSONException e) {
            Log.d("GRPC:::", e.getStackTrace().toString());
        }

        return map;
    }

    public WritableMap toResponse(QueueMessage response) {
        WritableMap map = Arguments.createMap();
        map.putMap("data", this.toJson(response));
        return map;
    }
}


