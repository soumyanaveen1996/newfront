package com.frontm.frontm.proto.converters;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableMap;
import com.frontm.commonmessages.proto.PhoneNumbers;

public class PhoneNumbersConverter {

    public WritableMap toJson(PhoneNumbers response) {
        WritableMap map = Arguments.createMap();
        map.putString("satellite", response.getSatellite());
        map.putString("land", response.getLand());
        map.putString("mobile", response.getMobile());
        return map;
    }
}
