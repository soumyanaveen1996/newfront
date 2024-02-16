import React, { useState, useEffect } from 'react';
import {
    Text,
    View,
    TouchableOpacity,
    Image,
    StyleSheet,
    Dimensions
} from 'react-native';
import constants from '../../../../config/constants';
import config from '../../../../config/config';
import { Auth, Media } from '../../../../lib/capability';
import utils from '../../../../lib/utils';
import { AssetFetcher } from '../../../../lib/dce';
import RNFS from 'react-native-fs';
import GlobalColors from '../../../../config/styles';
import Icons from '../../../../config/icons';
const ScreenSize = {
    w: Dimensions.get('window').width,
    h: Dimensions.get('window').height
};
export default ImagePicker = (props) => {
    const [imageUri, setImageUri] = useState(null);
    const [remoteUrl, setRemoteUrl] = useState(null);

    useEffect(() => {
        if (props.uri) {
            setImageUri(props.uri);
            console.log('image uri: ', props.uri);
            const remoteUrl = `${config.proxy.protocol}${config.proxy.resource_host}${config.proxy.downloadFilePath}/${props.conversationId}/${props.name}`;
            setRemoteUrl(remoteUrl);
        }
    });

    const pickImage = async () => {
        const result = await Media.pickMediaFromLibrary({
            allowsEditing: false,
            exif: true,
            base64: true
        });
        // if (!result.cancelled) {
        //     const imageUri = result.uri;
        //     const fileName =
        //         props.conversationId +
        //         props.formId +
        //         new Date().getTime().toString();
        //     const completeFilename = `${fileName}.png`;
        //     const newUri = `${constants.IMAGES_DIRECTORY}/${completeFilename}`;
        //     const exist = await RNFS.exists(newUri);
        //     if (exist) {
        //         await RNFS.unlink(newUri);
        //     }
        //     await RNFS.mkdir(constants.IMAGES_DIRECTORY);
        //     await RNFS.copyFile(imageUri, newUri);
        //     props.onSelectImage(completeFilename, newUri);
        // }
        props.onSelectImage(result);
    };

    return (
        <View>
            <View style={styles.imagePickerContainer}>
                <TouchableOpacity
                    style={styles.imageContainer}
                    disabled={props.disabled}
                    onPress={() => {
                        pickImage();
                    }}
                >
                    {props.uri ? (
                        <Image
                            key={imageUri}
                            source={{ uri: imageUri }}
                            style={styles.image}
                            resizeMode="cover"
                            onError={async () => {
                                try {
                                    await RNFS.mkdir(
                                        constants.IMAGES_DIRECTORY
                                    );
                                    const user = Auth.getUserData();
                                    const headers =
                                        utils.s3DownloadHeaders(
                                            remoteUrl,
                                            user
                                        ) || undefined;
                                    await AssetFetcher.downloadFile(
                                        imageUri,
                                        remoteUrl,
                                        headers,
                                        true,
                                        false
                                    );
                                    const exist = await AssetFetcher.existsOnDevice(
                                        imageUri
                                    );
                                    if (exist) {
                                        setImageUri(imageUri);
                                    } else {
                                    }
                                } catch (error) {}
                            }}
                        />
                    ) : (
                        <View style={styles.imageFieldContainer}>
                            {Icons.camera()}
                            <Text
                                style={{
                                    color: GlobalColors.darkGray,
                                    fontSize: 18
                                }}
                            >
                                Upload a photo
                            </Text>
                        </View>
                    )}
                </TouchableOpacity>
            </View>
            {props.uri && !props.disabled ? (
                <Text
                    onPress={props.onRemoveImage}
                    style={{
                        alignSelf: 'center',
                        fontSize: 16,
                        marginTop: 8,
                        color: GlobalColors.frontmLightBlue
                    }}
                >
                    Remove photo
                </Text>
            ) : null}
        </View>
    );
};

const styles = StyleSheet.create({
    imagePickerContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: ScreenSize.w * 0.8
    },
    imageContainer: {
        width: ScreenSize.w,
        height: ScreenSize.w * 0.8,
        position: 'absolute',
        left: -(ScreenSize.w * 0.1),
        backgroundColor: GlobalColors.textField,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden'
    },
    imageFieldContainer: {
        width: '92%',
        height: '92%',
        justifyContent: 'center',
        alignItems: 'center',
        borderStyle: 'dashed',
        borderWidth: 3,
        borderColor: GlobalColors.disabledGray
    },
    removeImage: {
        flexDirection: 'row',
        justifyContent: 'center',
        flex: 1
    },
    removeImageText: {
        fontSize: 16,
        color: GlobalColors.red,
        marginLeft: 10
    },
    image: {
        width: '100%',
        height: '100%'
    }
});
