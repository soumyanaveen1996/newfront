package com.frontm.frontm.proto.converters;

import android.util.Log;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.frontm.conversation.proto.TimelineBotInfo;
import com.frontm.conversation.proto.TimelineChannels;
import com.frontm.conversation.proto.TimelineContact;
import com.frontm.conversation.proto.TimelineContent;
import com.frontm.conversation.proto.TimelineConversation;
import com.frontm.conversation.proto.TimelineResponse;
import com.frontm.conversation.proto.UpdateFavouritesResponse;
import com.frontm.frontm.proto.JsonConvert;

import org.json.JSONArray;
import org.json.JSONException;

public class UpdateFavouritesResponseConverter {

    public WritableMap toJson(UpdateFavouritesResponse response) {

        WritableMap map = Arguments.createMap();
        map.putString("error", response.getError());
        return map;
    }

    public WritableMap toResponse(UpdateFavouritesResponse response) {
        WritableMap map = Arguments.createMap();
        map.putString("error", response.getError());
        map.putMap("data", this.toJson(response));
        return map;
    }
}


