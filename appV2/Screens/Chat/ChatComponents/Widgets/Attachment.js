import {
    StyleSheet,
    View,
    TouchableOpacity,
    Text,
    Image,
    ActivityIndicator,
    Alert
} from 'react-native';
import React, { useState } from 'react';
import DocumentPicker from 'react-native-document-picker';
import RNFS from 'react-native-fs';
import GlobalColors from '../../../../config/styles';
import Icons from '../../../../config/icons';
import BottomSheet from './BottomSheet';
import { Media } from '../../../../lib/capability';
import config from '../../../Chat/config';
import images from '../../../../images';
import { async } from 'rxjs';
import { AssetFetcher } from '../../../../lib/dce';
import { downLoadBotFile, openBotFile } from '../../../../lib/utils/FileUtils';
import constants from '../../../../config/constants';
import AlertDialog from '../../../../lib/utils/AlertDialog';
import { Toast } from 'react-native-toast-message/lib/src/Toast';

const availableOptions = [
    { text: 'Camera', icon: images.form_attach_cam },
    { text: 'Photo library', icon: images.form_attach_photo },
    { text: 'Video library', icon: images.form_attach_video },
    { text: 'Document', icon: images.form_attach_doc }
];

export default Attachment = (props) => {
    const [showOptions, setShowOptions] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const [newFileSelected, setNewFileSelected] = useState(false);

    const {
        fieldData,
        handleChange,
        processFileSelection,
        id,
        selectedFileInfo,
        currentSelection,
        disabled
    } = props;
    console.log('~~~~~ attachemnt props', props);
    console.log('~~~~~ attachemnt state', showOptions, newFileSelected);

    let localPath = null;
    if (currentSelection) {
        localPath = decodeURI(
            `${constants.OTHER_FILE_DIRECTORY}/${currentSelection}`
        );
    } else if (fieldData.value != null) {
        localPath = decodeURI(
            `${constants.OTHER_FILE_DIRECTORY}/${fieldData.value}`
        );
    }
    const activeFilePresent = selectedFileInfo || currentSelection;
    const pickFile = (type) => {
        switch (type) {
            case 'Camera': {
                Media.takePicture(config.CameraOptions).then((image) => {
                    setNewFileSelected(true);
                    processFileSelection(fieldData, image, id);
                });
                break;
            }
            case 'Photo library': {
                Media.pickMediaFromLibrary(config.CameraOptions).then(
                    (image) => {
                        setNewFileSelected(true);
                        processFileSelection(fieldData, image, id);
                    }
                );
                break;
            }
            case 'Video library': {
                Media.pickMediaFromLibrary(config.videoptions).then((video) => {
                    if (Platform.OS === 'android') {
                        RNFS.stat(video.uri).then((res) => {
                            video.uri = res.originalFilepath;
                            video.type = 'video';
                            processFileSelection(fieldData, video, id);
                            setNewFileSelected(true);
                        });
                    } else {
                        processFileSelection(fieldData, video, id);
                        setNewFileSelected(true);
                    }
                });
                break;
            }
            default: {
                DocumentPicker.pick({
                    type: [DocumentPicker.types.allFiles]
                }).then((res) => {
                    const fileSize = res.size / Math.pow(1024, 2);
                    if (fileSize > 10.0) {
                        AlertDialog.show(
                            'File too large!',
                            'Maximum file size supported is 10MB.'
                        );
                    }
                    processFileSelection(
                        fieldData,
                        {
                            cancelled: false,
                            type: res.type,
                            uri: res.uri,
                            name: res.name
                        },
                        id
                    );
                    setNewFileSelected(true);
                });
            }
        }
    };

    const openOrDownload = () => {
        if (localPath === null) {
            Toast.show({ text1: 'File Not found.' });
            return;
        }
        AssetFetcher.existsOnDevice(localPath).then((exists) => {
            if (exists) {
                openBotFile(localPath);
            } else {
                setDownloading(true);
                downLoadBotFile(fieldData.value, localPath, fieldData.fileScope)
                    .then(() => {
                        setDownloading(false);
                        openBotFile(localPath);
                    })
                    .catch((e) => {
                        console.log(e);
                        setDownloading(false);
                        Toast.show({ text1: e.message });
                    });
            }
        });
    };

    return (
        <View>
            <TouchableOpacity
                disabled={downloading}
                style={{
                    flexDirection: 'row',
                    // justifyContent: 'space-between',
                    flex: 1,
                    alignItems: 'center'
                }}
                onPress={() => {
                    // TODO hadnle file upload
                    if (activeFilePresent) {
                        // processFileSelection(fieldData, { removed: true }, id);
                        //TODO view file
                        openOrDownload();
                    } else {
                        if (fieldData.readOnly) return;
                        setShowOptions(true);
                    }
                }}
            >
                {downloading && <ActivityIndicator size={'small'} />}
                <Text style={styles.fieldLabel}>
                    {selectedFileInfo?.file?.name
                        ? selectedFileInfo?.file?.name
                        : currentSelection
                        ? currentSelection
                        : 'Select file'}
                </Text>
                <TouchableOpacity
                    disabled={props.disabled}
                    style={{ padding: 5 }}
                    onPress={() => {
                        if (activeFilePresent) {
                            processFileSelection(
                                fieldData,
                                { removed: true },
                                id
                            );
                        } else {
                            if (fieldData.readOnly) return;
                            setShowOptions(true);
                        }
                    }}
                >
                    {activeFilePresent
                        ? Icons.close({
                              size: 25,
                              color: GlobalColors.disabledGray
                          })
                        : Icons.keyboardArrowRight()}
                </TouchableOpacity>
            </TouchableOpacity>
            <BottomSheet
                visible={showOptions}
                transparent
                onPressOutside={() => setShowOptions(false)}
                onDismiss={() => setShowOptions(false)}
            >
                <View style={{ flexGrow: 1 }}>
                    {availableOptions.map((item) => (
                        <TouchableOpacity
                            style={{
                                backgroundColor: GlobalColors.white
                            }}
                            onPress={() => {
                                setShowOptions(false);
                                setTimeout(() => {
                                    pickFile(item.text);
                                }, 800);
                            }}
                        >
                            <View style={styles.filterModalItem}>
                                <Image
                                    style={{ height: 24, width: 24 }}
                                    source={item.icon}
                                />
                                <Text style={styles.filterModalItemText}>
                                    {item.text}
                                </Text>
                            </View>
                            <View style={styles.filterModalDivider} />
                        </TouchableOpacity>
                    ))}
                </View>
            </BottomSheet>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        alignContent: 'flex-start',
        paddingTop: 8,
        borderRadius: 6
    },

    fieldLabel: {
        fontSize: 16,
        color: GlobalColors.textBlack,
        alignItems: 'center',
        justifyContent: 'center',
        flexWrap: 'wrap',
        flexShrink: 1
    },
    filterModalDivider: {
        marginHorizontal: 24,
        borderBottomWidth: 1,
        borderBottomColor: GlobalColors.formDevider
    },
    filterModalItem: {
        paddingVertical: 16,
        paddingLeft: 34,
        flexDirection: 'row'
    },
    filterModalItemText: {
        fontSize: 14,
        color: GlobalColors.menuSubLable,
        paddingLeft: 8
    }
});
