import React from 'react';
import { View, FlatList } from 'react-native';
import Placeholder from 'rn-placeholder';
import _ from 'lodash';
import GlobalColors from '../../../config/styles';

const renderItem = () => {
    return (
        <View
            style={{
                flexDirection: 'row',
                paddingHorizontal: 10,
                paddingVertical: 17
            }}
        >
            <View
                style={{
                    width: 30,
                    height: 30,
                    borderRadius: 15,
                    marginTop: 5,
                    backgroundColor: GlobalColors.darkGray
                }}
            />
            <View style={{ width: '100%', marginLeft: 10 }}>
                <View
                    style={{
                        width: '40%',
                        height: 16,
                        borderRadius: 3,
                        backgroundColor: GlobalColors.darkGray
                    }}
                />
                <View
                    style={{
                        width: '100%',
                        height: 12,
                        marginTop: 5,
                        borderRadius: 3,
                        backgroundColor: GlobalColors.disabledGray
                    }}
                />
                <View
                    style={{
                        width: '60%',
                        height: 12,
                        marginTop: 5,
                        borderRadius: 3,
                        backgroundColor: GlobalColors.disabledGray
                    }}
                />
            </View>
        </View>
    );
};
const customPlaceholder = (props) => {
    const arrayData = Array(12)
        .fill(true)
        .map((_, i) => ({ key: `${i}`, value: true }));
    return (
        <FlatList
            data={arrayData}
            ListHeaderComponent={props.header}
            renderItem={renderItem}
        />
    );
};

export default Placeholder.connect(customPlaceholder);
