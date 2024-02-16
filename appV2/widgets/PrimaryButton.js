import React from 'react';
import GlobalColors from '../config/styles';
import { FMButton } from './FMButton';

/**
 * Renders +ve action button.  color, textColor props can be passed to customize if required. All touchableOpacity props work
 * @param {*} props
 * @returns
 */
export const PrimaryButton = (props) => {
    return (
        <FMButton
            color={props.color || GlobalColors.primaryButtonColor}
            colorDisabled={GlobalColors.primaryButtonColorDisabled}
            textColor={props.textColor || GlobalColors.primaryButtonText}
            textColorDisabled={GlobalColors.primaryButtonTextDisabled}
            {...props}
        />
    );
};
