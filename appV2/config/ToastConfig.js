import React from 'react';
import { Icon } from '@rneui/themed';
import { View, Text } from 'react-native';
import GlobalColors from './styles';
import { Card } from 'react-native-paper';

/**
 * Settings for global toast.
 * By default the error type will se used as we have etioned in the provider.
 * use  Toast.show({  text1: '<<>>', type:"<<>>" }) to show toast. you can pass any of the type declated here.
 * if you dont pass type, default will be taken
 * https://app.zeplin.io/project/610142d18469851557df2cf2/screen/647f9b771d12940e31f5e802
 */
const toastConfig = {
    standard: (props) => (
        <Card
            style={{
                backgroundColor: GlobalColors.toastBackground,
                borderRadius: 10,
                padding: 15,
                paddingHorizontal: 18
            }}
        >
            <Text style={{ color: GlobalColors.toastText, fontSize: 14 }}>
                {props.text1}
            </Text>
            {props.text2 && (
                <Text
                    style={{
                        color: GlobalColors.toastText,
                        fontSize: 13
                    }}
                >
                    {props.text2}
                </Text>
            )}
        </Card>
    ),
    success: (props) => (
        <Card
            style={{
                backgroundColor: GlobalColors.toastBacgroundAlternate,
                borderRadius: 10,
                padding: 15,
                paddingHorizontal: 18
            }}
        >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Icon
                    name="check-circle"
                    type="material"
                    size={22}
                    color={GlobalColors.green}
                />
                <Text
                    style={{
                        color: GlobalColors.toastTextAlternate,
                        fontSize: 14,
                        marginLeft: 8
                    }}
                >
                    {props.text1}
                </Text>
            </View>
        </Card>
    ),
    alert: (props) => (
        <Card
            style={{
                backgroundColor: GlobalColors.toastBacgroundAlternate,
                borderRadius: 10,
                padding: 15,
                paddingHorizontal: 18
            }}
        >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Icon name="warning" type="ionicon" color="#ff9900" size={22} />
                <Text
                    style={{
                        color: GlobalColors.toastTextAlternate,
                        fontSize: 14,
                        marginLeft: 8
                    }}
                >
                    {props.text1}
                </Text>
            </View>
        </Card>
    ),
    error: (props) => (
        <Card
            style={{
                backgroundColor: GlobalColors.toastBacgroundAlternate,
                borderRadius: 10,
                padding: 15,
                paddingHorizontal: 18
            }}
        >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Icon
                    name="warning"
                    type="ionicon"
                    color={GlobalColors.red}
                    size={22}
                />
                <Text
                    style={{
                        color: GlobalColors.toastTextAlternate,
                        fontSize: 14,
                        marginLeft: 8
                    }}
                >
                    {props.text1}
                </Text>
            </View>
        </Card>
    )
};

export default toastConfig;
