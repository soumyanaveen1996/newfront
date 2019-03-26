package com.frontm.frontm.proto.converters;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.frontm.conversation.proto.CatalogBot;
import com.frontm.conversation.proto.CatalogBotClients;
import com.frontm.conversation.proto.CatalogDependencies;
import com.frontm.conversation.proto.CatalogDependency;
import com.frontm.conversation.proto.CatalogResponse;

public class CatalogResponseConverter {

    private class CatalogDependencyConverter {

        public WritableMap toJson(CatalogDependency dep) {
            WritableMap map = Arguments.createMap();
            map.putString("version", dep.getVersion());
            map.putString("url", dep.getUrl());
            map.putBoolean("remote", dep.getRemote());
            return map;
        }
    }


    private class CatalogDependenciesConverter {

        public WritableMap toJson(CatalogDependencies deps) {
            WritableMap map = Arguments.createMap();
            if (deps.hasAgentGuardService()) {
                map.putMap("agentGuardService", new CatalogDependencyConverter().toJson(deps.getAgentGuardService()));
            }
            if (deps.hasAuthContext()) {
                map.putMap("authContext", new CatalogDependencyConverter().toJson(deps.getAuthContext()));
            }
            if (deps.hasArchiveUtils()) {
                map.putMap("archiveUtils", new CatalogDependencyConverter().toJson(deps.getArchiveUtils()));
            }
            if (deps.hasBotUtils()) {
                map.putMap("botUtils", new CatalogDependencyConverter().toJson(deps.getBotUtils()));
            }
            if (deps.hasAutoRenewConversationContext()) {
                map.putMap("autoRenewConversationContext", new CatalogDependencyConverter().toJson(deps.getAutoRenewConversationContext()));
            }
            return map;

        }
    }

    private class CatalogBotClientsConverter {

        public WritableMap toJson(CatalogBotClients client) {
            WritableMap map = Arguments.createMap();
            map.putBoolean("mobile", client.getMobile());
            map.putBoolean("web", client.getWeb());
            return map;
        }
    }

    private class CatalogBotConverter {

        public WritableMap toJson(CatalogBot bot) {
            WritableMap map = Arguments.createMap();
            map.putString("botId", bot.getBotId());
            map.putString("userDomain", bot.getUserDomain());
            map.putString("allowResetConversation", bot.getAllowResetConversation());
            map.putString("botName", bot.getBotName());
            map.putString("botUrl", bot.getBotUrl());
            map.putString("botNameSearch", bot.getBotNameSearch());
            map.putString("description", bot.getDescription());
            map.putString("descriptionSearch", bot.getDescriptionSearch());
            map.putString("logoUrl", bot.getLogoUrl());
            map.putString("slug", bot.getSlug());
            map.putString("version", bot.getVersion());
            map.putString("developer", bot.getDeveloper());
            map.putString("minRequiredPlatformVersion", bot.getMinRequiredPlatformVersion());

            map.putBoolean("featured", bot.getFeatured());
            map.putBoolean("systemBot", bot.getSystemBot());


            if (bot.hasBotClients()) {
                map.putMap("botClients", new CatalogBotClientsConverter().toJson(bot.getBotClients()));
            }

            if (bot.getCategoryCount() > 0) {
                WritableArray array = Arguments.createArray();
                for (int i = 0; i < bot.getCategoryCount(); ++i) {
                    array.pushString(bot.getCategory(i));
                }
                map.putArray("category", array);
            } else {
                map.putArray("category", Arguments.createArray());
            }

            if (bot.getUserRolesCount() > 0) {
                WritableArray array = Arguments.createArray();
                for (int i = 0; i < bot.getUserRolesCount(); ++i) {
                    array.pushString(bot.getUserRoles(i));
                }
                map.putArray("userRoles", array);
            } else {
                map.putArray("userRoles", Arguments.createArray());
            }

            if (bot.hasDependencies()) {
                map.putMap("dependencies", new CatalogDependenciesConverter().toJson(bot.getDependencies()));
            }

            return map;
        }
    }



    public WritableMap toJson(CatalogResponse response) {

        WritableMap map = Arguments.createMap();
        if (response.getBotsCount() > 0) {
            WritableArray array = Arguments.createArray();
            for (int i = 0; i < response.getBotsCount(); ++i) {
                array.pushMap(new CatalogBotConverter().toJson(response.getBots(i)));
            }
            map.putArray("bots", array);
        } else {
            map.putArray("bots", Arguments.createArray());
        }
        return map;
    }

    public WritableMap toResponse(CatalogResponse response) {
        WritableMap map = Arguments.createMap();
        map.putMap("data", this.toJson(response));
        return map;
    }
}


