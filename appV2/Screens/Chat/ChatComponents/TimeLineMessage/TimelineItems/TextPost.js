import React from 'react';
import { View } from 'react-native';

import GlobalColors from '../../../../../config/styles';
import TextLessMoreView from '../../Widgets/TextWithReadMore';

const TextPost = ({ text }) => {
    return (
        <View style={{ flex: 1, paddingHorizontal: 10 }}>
            <TextLessMoreView text={text} targetLines={2} />
            <View
                style={{
                    backgroundColor: GlobalColors.itemDevider,
                    height: 1,
                    marginTop: 18
                }}
            />
        </View>
    );
};
function customComparator(prevProps, nextProps) {
    if (prevProps.text !== nextProps.text) {
        return false;
    } else {
        return true;
    }
}
export default React.memo(TextPost, customComparator);
