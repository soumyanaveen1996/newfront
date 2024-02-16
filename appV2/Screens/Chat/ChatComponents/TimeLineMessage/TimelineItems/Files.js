import React from 'react';
import {
    Text,
    View,
    ActivityIndicator,
    FlatList,
    TouchableOpacity,
    StyleSheet
} from 'react-native';

import GlobalColors from '../../../../../config/styles';
import { getScopeId } from '../../../../../lib/utils/FileUtils';
import configToUse from '../../../../../config/config';
import FileViewWrapper, { FileState } from '../../Widgets/FileViewWrapper';
import { Card, Icon } from '@rneui/themed';
import TextLessMoreView from '../../Widgets/TextWithReadMore';

export default Files = ({ files, text = null }) => {
    const renderView = (status, fileInfo, clickEventHandler) => {
        return (
            <Card containerStyle={styles.container}>
                <View style={styles.rowContainer}>
                    <View>
                        <Icon
                            name="ios-document"
                            type="ionicon"
                            size={40}
                            color={'#CB0505'}
                        />
                        <View style={styles.textContainer}>
                            <Text style={styles.text}>
                                {fileInfo.extention}
                            </Text>
                        </View>
                    </View>
                    <Text style={{ flex: 1 }}>{fileInfo.name}</Text>
                    <TouchableOpacity
                        disabled={status === FileState.DOWNLOADING}
                        style={styles.actionButtonContainer}
                        onPress={clickEventHandler}
                    >
                        {status === FileState.DOWNLOADING ? (
                            <ActivityIndicator size="small" />
                        ) : (
                            <Icon
                                name={
                                    status === FileState.REMOTE
                                        ? 'save-alt'
                                        : 'open-in-new'
                                }
                                color={GlobalColors.primaryButtonColor}
                                type="material"
                                size={30}
                            />
                        )}
                    </TouchableOpacity>
                </View>
            </Card>
        );
    };

    const renderiTem = ({ item }) => {
        const url = `${configToUse.proxy.protocol}${
            configToUse.proxy.resource_host
        }/downloadwithsignedurl/${item.fileUrl.fileScope}/${getScopeId(
            item.fileUrl.fileScope
        )}/${item.fileUrl.value}`;

        return (
            <View style={{ flex: 1 }}>
                <FileViewWrapper
                    fileView={renderView}
                    source={{
                        fileName: item.fileUrl.value,
                        scope: item.fileUrl.fileScope,
                        displayName: item.fileName
                    }}
                />
            </View>
        );
    };
    return (
        <View style={{ flex: 1 }}>
            {text && (
                <View style={{ paddingHorizontal: 10, marginBottom: 4 }}>
                    <TextLessMoreView text={text} targetLines={2} />
                </View>
            )}
            <FlatList
                renderItem={renderiTem}
                data={files}
                ItemSeparatorComponent={() => {
                    return <View style={{ height: 12 }} />;
                }}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    text: {
        color: 'white',
        fontSize: 12,
        marginTop: 12,
        textAlign: 'center'
    },
    textContainer: {
        position: 'absolute',
        color: 'white',
        alignContent: 'center',
        justifyContent: 'center',
        fontSize: 12,
        left: 0,
        right: 0,
        top: 0,
        bottom: 0
    },
    actionButtonContainer: {
        alignSelf: 'flex-end',
        alignContent: 'center',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center'
    },
    rowContainer: {
        flex: 1,
        flexDirection: 'row',
        marginHorizontal: 10,
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    container: {
        flex: 1,
        padding: 0,
        paddingVertical: 10,
        marginHorizontal: 10,
        borderRadius: 6,
        paddingHorizontal: 6,
        margin: 0
    }
});
