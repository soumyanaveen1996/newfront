import React from 'react';
import { Switch } from 'react-native';
import GlobalColors from '../config/styles';

export const SwitchControll = (props) => (
    <Switch
        trackColor={{
            true: GlobalColors.switchTrackTrue,
            false: GlobalColors.switchTrackFalse
        }}
        thumbColor={
            props.value
                ? GlobalColors.switchThumbTrue
                : GlobalColors.switchThumbFalse
        }
        style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
        {...props}
    />
);
