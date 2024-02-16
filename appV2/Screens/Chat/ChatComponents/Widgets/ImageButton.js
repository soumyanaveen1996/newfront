import React from 'react';
import { Image } from 'react-native';
import { Button } from 'react-native-paper';
import GlobalColors from '../../../../config/styles';

export const ImageButton = (props) => (
    <Button
        style={{ padding: 0 }}
        compact
        onPress={props?.onPress}
        theme={{
            colors: {
                primary: props.onPressColor || GlobalColors.grey
            }
        }}
    >
        <Image source={props.image} resizeMode="contain" style={props.style} />
    </Button>
);
