package com.frontm.frontm.proto;


import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.ReadableMapKeySetIterator;
import com.facebook.react.bridge.ReadableType;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.Iterator;
import java.util.Map;
import java.util.HashMap;

public abstract class JsonConvert {
    public static JSONObject reactToJSON(ReadableMap readableMap) throws JSONException {
        JSONObject jsonObject = new JSONObject();
        ReadableMapKeySetIterator iterator = readableMap.keySetIterator();
        while(iterator.hasNextKey()){
            String key = iterator.nextKey();
            ReadableType valueType = readableMap.getType(key);
            switch (valueType){
                case Null:
                    jsonObject.put(key,JSONObject.NULL);
                    break;
                case Boolean:
                    jsonObject.put(key, readableMap.getBoolean(key));
                    break;
                case Number:
                    try {
                        jsonObject.put(key, readableMap.getInt(key));
                    } catch(Exception e) {
                        jsonObject.put(key, readableMap.getDouble(key));
                    }
                    break;
                case String:
                    jsonObject.put(key, readableMap.getString(key));
                    break;
                case Map:
                    jsonObject.put(key, reactToJSON(readableMap.getMap(key)));
                    break;
                case Array:
                    jsonObject.put(key, reactToJSON(readableMap.getArray(key)));
                    break;
            }
        }

        return jsonObject;
    }

    public static JSONArray reactToJSON(ReadableArray readableArray) throws JSONException {
        JSONArray jsonArray = new JSONArray();
        for(int i=0; i < readableArray.size(); i++) {
            ReadableType valueType = readableArray.getType(i);
            switch (valueType){
                case Null:
                    jsonArray.put(JSONObject.NULL);
                    break;
                case Boolean:
                    jsonArray.put(readableArray.getBoolean(i));
                    break;
                case Number:
                    try {
                        jsonArray.put(readableArray.getInt(i));
                    } catch(Exception e) {
                        jsonArray.put(readableArray.getDouble(i));
                    }
                    break;
                case String:
                    jsonArray.put(readableArray.getString(i));
                    break;
                case Map:
                    jsonArray.put(reactToJSON(readableArray.getMap(i)));
                    break;
                case Array:
                    jsonArray.put(reactToJSON(readableArray.getArray(i)));
                    break;
            }
        }
        return jsonArray;
    }

    public static WritableMap jsonToReact(JSONObject jsonObject) throws JSONException {
        WritableMap writableMap = Arguments.createMap();
        Iterator iterator = jsonObject.keys();
        while(iterator.hasNext()) {
            String key = (String) iterator.next();
            Object value = jsonObject.get(key);
            if (value instanceof Float || value instanceof Double) {
                writableMap.putDouble(key, jsonObject.getDouble(key));
            } else if (value instanceof Number) {
                writableMap.putDouble(key, jsonObject.getDouble(key));
            } else if (value instanceof String) {
                writableMap.putString(key, jsonObject.getString(key));
            } else if (value instanceof Boolean){
                writableMap.putBoolean(key, jsonObject.getBoolean(key));
            } else if (value instanceof JSONObject) {
                writableMap.putMap(key,jsonToReact(jsonObject.getJSONObject(key)));
            } else if (value instanceof JSONArray){
                writableMap.putArray(key, jsonToReact(jsonObject.getJSONArray(key)));
            } else if (value == JSONObject.NULL){
                writableMap.putNull(key);
            }
        }

        return writableMap;
    }

    public static WritableArray jsonToReact(JSONArray jsonArray) throws JSONException {
        WritableArray writableArray = Arguments.createArray();
        for(int i=0; i < jsonArray.length(); i++) {
            Object value = jsonArray.get(i);
            if (value instanceof Float || value instanceof Double) {
                writableArray.pushDouble(jsonArray.getDouble(i));
            } else if (value instanceof Number) {
                writableArray.pushInt(jsonArray.getInt(i));
            } else if (value instanceof String) {
                writableArray.pushString(jsonArray.getString(i));
            } else if (value instanceof JSONObject) {
                writableArray.pushMap(jsonToReact(jsonArray.getJSONObject(i)));
            } else if (value instanceof JSONArray){
                writableArray.pushArray(jsonToReact(jsonArray.getJSONArray(i)));
            } else if (value == JSONObject.NULL){
                writableArray.pushNull();
            }
        }
        return writableArray;
    }

    public static Map<String, Object> reactToMap(ReadableMap readableMap) {
        Map<String, Object> map = new HashMap<>();
        ReadableMapKeySetIterator iterator = readableMap.keySetIterator();

        while (iterator.hasNextKey()) {
            String key = iterator.nextKey();
            ReadableType type = readableMap.getType(key);

            switch (type) {
                case Null:
                    map.put(key, null);
                    break;
                case Boolean:
                    map.put(key, readableMap.getBoolean(key));
                    break;
                case Number:
                    map.put(key, readableMap.getDouble(key));
                    break;
                case String:
                    map.put(key, readableMap.getString(key));
                    break;
                case Map:
                    map.put(key, reactToMap(readableMap.getMap(key)));
                    break;
                case Array:
                    map.put(key, reactToArray(readableMap.getArray(key)));
                    break;
            }
        }

        return map;
    }

    public static Object[] reactToArray(ReadableArray readableArray) {
        Object[] array = new Object[readableArray.size()];

        for (int i = 0; i < readableArray.size(); i++) {
            ReadableType type = readableArray.getType(i);

            switch (type) {
                case Null:
                    array[i] = null;
                    break;
                case Boolean:
                    array[i] = readableArray.getBoolean(i);
                    break;
                case Number:
                    array[i] = readableArray.getDouble(i);
                    break;
                case String:
                    array[i] = readableArray.getString(i);
                    break;
                case Map:
                    array[i] = reactToMap(readableArray.getMap(i));
                    break;
                case Array:
                    array[i] = reactToArray(readableArray.getArray(i));
                    break;
            }
        }

        return array;
    }
}