import React from 'react';
import GlobalColors from '../config/styles';
import { FMButton } from './FMButton';

/**
 * Renders -ve action button. All touchableOpacity props work
 * @param {*} props
 * @returns
 */
export const SecondaryButton = (props) => {
    return (
        <FMButton
            color={GlobalColors.secondaryButtonColor}
            colorDisabled={GlobalColors.secondaryButtonColorDisabled}
            textColor={GlobalColors.secondaryButtonText}
            textColorDisabled={GlobalColors.secondaryButtonTextDisabled}
            {...props}
        />
    );
};
