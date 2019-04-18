package com.frontm.frontm.proto.converters;

import android.util.Log;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.frontm.conversation.proto.GetArchivedMessagesContent;
import com.frontm.conversation.proto.GetArchivedMessagesResponse;
import com.frontm.conversation.proto.TimelineBotInfo;
import com.frontm.conversation.proto.TimelineChannels;
import com.frontm.conversation.proto.TimelineContact;
import com.frontm.conversation.proto.TimelineContent;
import com.frontm.conversation.proto.TimelineConversation;
import com.frontm.conversation.proto.TimelineResponse;
import com.frontm.frontm.proto.JsonConvert;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

public class TimelineResponseConverter {

    private class TimelineContentConverter {
        public WritableMap toJson(TimelineContent response) {

            WritableMap map = Arguments.createMap();

            if (response.getConversationsCount() > 0) {
                WritableArray array = Arguments.createArray();
                for (int i = 0; i < response.getConversationsCount(); ++i) {
                    array.pushMap(new TimelineConversationConverter().toJson(response.getConversations(i)));
                }
                map.putArray("conversations", array);
            } else {
                map.putArray("conversations", Arguments.createArray());
            }

            if (response.getFavouritesCount() > 0) {
                WritableArray array = Arguments.createArray();
                for (int i = 0; i < response.getFavouritesCount(); ++i) {
                    array.pushMap(new TimelineConversationConverter().toJson(response.getFavourites(i)));
                }
                map.putArray("favourites", array);
            } else {
                map.putArray("favourites", Arguments.createArray());
            }
            return map;
        }
    }


    private class TimelineConversationConverter {

        public WritableMap toJson(TimelineConversation conversation) {
            WritableMap map = Arguments.createMap();
            map.putBoolean("closed", conversation.getClosed());

            if (conversation.getParticipantsCount() > 0) {
                WritableArray array = Arguments.createArray();
                for (int i = 0; i < conversation.getParticipantsCount(); ++i) {
                    array.pushString(conversation.getParticipants(i));
                }
                map.putArray("participants", array);
            } else {
                map.putArray("participants", Arguments.createArray());
            }

            map.putDouble("createdOn", conversation.getCreatedOn());
            map.putDouble("modifiedOn", conversation.getModifiedOn());

            map.putString("userDomain", conversation.getUserDomain());
            map.putString("conversationId", conversation.getConversationId());
            map.putString("createdBy", conversation.getCreatedBy());


            if (conversation.getOnChannelsCount() > 0) {
                WritableArray array = Arguments.createArray();
                for (int i = 0; i < conversation.getOnChannelsCount(); ++i) {
                    array.pushMap(new TimelineChannelsConverter().toJson(conversation.getOnChannels(i)));
                }
                map.putArray("onChannels", array);
            } else {
                map.putArray("onChannels", Arguments.createArray());
            }

            if (conversation.hasBot()) {
                map.putMap("bot", new TimelineBotInfoConverter().toJson(conversation.getBot()));
            }

            if (conversation.hasContact()) {
                map.putMap("contact", new TimelineContactConverter().toJson(conversation.getContact()));
            }


            if (conversation.getLastMessage() != null) {
                try {
                    JSONObject json = new JSONObject(conversation.getLastMessage().toStringUtf8());
                    Log.d("GRPC:::Lastmessage", conversation.getLastMessage().toStringUtf8());
                    map.putMap("lastMessage", JsonConvert.jsonToReact(json));
                } catch (JSONException e) {
                    Log.d("GRPC:::Error", e.getStackTrace().toString());
                }
            }


            return map;
        }
    }


    private class TimelineChannelsConverter {

        public WritableMap toJson(TimelineChannels channels) {

            WritableMap map = Arguments.createMap();
            map.putString("channelName", channels.getChannelName());
            map.putString("userDomain", channels.getUserDomain());
            return map;

        }
    }

    private class TimelineContactConverter {

        public WritableMap toJson(TimelineContact contact) {
            WritableMap map = Arguments.createMap();
            map.putString("userName", contact.getUserName());
            map.putString("userId", contact.getUserId());
            map.putBoolean("searchable", contact.getSearchable());
            map.putBoolean("visible", contact.getVisible());
            return map;
        }
    }

    private class TimelineBotInfoConverter {

        public WritableMap toJson(TimelineBotInfo botInfo) {
            WritableMap map = Arguments.createMap();
            map.putString("allowResetConversation", botInfo.getAllowResetConversation());
            map.putString("botName", botInfo.getBotName());
            map.putString("logoURL", botInfo.getLogoUrl());
            map.putString("slug", botInfo.getSlug());
            map.putString("botId", botInfo.getBotId());
            map.putString("userDomain", botInfo.getUserDomain());
            map.putString("botURL", botInfo.getBotUrl());
            map.putString("description", botInfo.getDescription());
            map.putBoolean("systemBot", botInfo.getSystemBot());
            return map;
        }
    }



    public WritableMap toJson(TimelineResponse response) {

        WritableMap map = Arguments.createMap();
        map.putString("error", response.getError());
        if (response.hasContent()) {
            map.putMap("content", new TimelineContentConverter().toJson(response.getContent()));
        }
        return map;
    }

    public WritableMap toResponse(TimelineResponse response) {
        WritableMap map = Arguments.createMap();
        map.putMap("data", this.toJson(response));
        return map;
    }
}


