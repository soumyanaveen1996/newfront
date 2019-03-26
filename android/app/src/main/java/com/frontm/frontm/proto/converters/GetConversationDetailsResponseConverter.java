package com.frontm.frontm.proto.converters;

import android.util.Log;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.frontm.conversation.proto.GetConversationDetailsChannels;
import com.frontm.conversation.proto.GetConversationDetailsResponse;
import com.frontm.conversation.proto.GetConversationDetailsUser;

public class GetConversationDetailsResponseConverter {

    private class GetConversationDetailsUserConverter {

        public WritableMap toJson(GetConversationDetailsUser user) {

            WritableMap map = Arguments.createMap();
            map.putString("userId", user.getUserId());
            map.putString("userName", user.getUserName());
            return map;

        }
    }

    private class GetConversationDetailsChannelsConverter {

        public WritableMap toJson(GetConversationDetailsChannels channel) {
            WritableMap map = Arguments.createMap();
            map.putString("channelName", channel.getChannelName());
            map.putString("userDomain", channel.getUserDomain());
            map.putString("channelId", channel.getChannelId());
            map.putString("description", channel.getDescription());
            map.putString("logo", channel.getLogo());
            return map;
        }
    }



    public WritableMap toJson(GetConversationDetailsResponse response) {

        WritableMap map = Arguments.createMap();
        map.putInt("error", response.getError());
        if (response.hasConversationOwner()) {
            map.putMap("conversationOwner", new GetConversationDetailsUserConverter().toJson(response.getConversationOwner()));
        }

        if (response.getOnChannelsCount() > 0) {
            WritableArray array = Arguments.createArray();
            for (int i = 0; i < response.getOnChannelsCount(); ++i) {
                array.pushMap(new GetConversationDetailsChannelsConverter().toJson(response.getOnChannels(i)));
            }
            map.putArray("onChannels", array);
        } else {
            map.putArray("onChannels", Arguments.createArray());
        }

        if (response.getParticipantsCount() > 0) {
            WritableArray array = Arguments.createArray();
            for (int i = 0; i < response.getParticipantsCount(); ++i) {
                array.pushMap(new GetConversationDetailsUserConverter().toJson(response.getParticipants(i)));
            }
            map.putArray("participants", array);
        } else {
            map.putArray("participants", Arguments.createArray());
        }
        return map;
    }

    public WritableMap toResponse(GetConversationDetailsResponse response) {
        WritableMap map = Arguments.createMap();
        map.putInt("error", response.getError());
        map.putMap("data", this.toJson(response));
        return map;
    }
}


