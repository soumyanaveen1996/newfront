import React from 'react';
import { View, Text, FlatList } from 'react-native';
import Placeholder from 'rn-placeholder';
import GlobalColors from '../../config/styles';
import _ from 'lodash';

const customPlaceholder = props => {
    return (
        <FlatList
            data={[
                true,
                true,
                true,
                true,
                true,
                true,
                true,
                true,
                true,
                true,
                true,
                true
            ]}
            ListHeaderComponent={props.header}
            renderItem={() => (
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
            )}
        />
    );
};

export default Placeholder.connect(customPlaceholder);
