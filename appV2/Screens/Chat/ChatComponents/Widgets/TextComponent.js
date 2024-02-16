import {
    StyleSheet,
    View,
    Pressable,
    Text,
    Image,
    ActivityIndicator,
    Alert,
    Dimensions
} from 'react-native';
import React, { useState } from 'react';
import { Toast } from 'react-native-toast-message/lib/src/Toast';
import { MessageTypeConstants } from '../../../../lib/capability';
import utils from '../../../../lib/utils';
import RenderHTML from 'react-native-render-html';
import Clipboard from '@react-native-clipboard/clipboard';
import styles, { chatMessageBubbleStyle } from '../../styles';
import GlobalColors from '../../../../config/styles';
import Icons from '../../../../config/icons';
const width = Dimensions.get('screen').width;
const widthForContent = width - 60;
import { memo } from 'react';
import AppFonts from '../../../../config/fontConfig';

const TextComponent = ({ message, showTime, user }) => {
    if (!message.getDisplayMessage()) {
        return null;
    }
    const canCopyPaste =
        message.getMessageType() === MessageTypeConstants.MESSAGE_TYPE_STRING
            ? true
            : false;

    const text = message.getDisplayMessage();
    const displayMessage = utils.isHTML(text) ? text : utils.urlify(text);
    const tagsStyles = React.useMemo(
        () => ({
            html: {
                color: GlobalColors.chatTextColor,
                fontFamily: 'Figtree-Light',
                position: 'relative',
                width: widthForContent
            },
            body: {
                color: GlobalColors.chatTextColor,
                fontFamily: 'Figtree-Light',
                position: 'relative',
                width: widthForContent
            },
            p: {
                color: GlobalColors.chatTextColor,
                fontFamily: 'Figtree-Light',
                position: 'relative',
                fontSize: 14,
                padding: 0,
                margin: 0
            },
            sub: {
                color: GlobalColors.chatTextColor,
                fontSize: 8,
                position: 'relative',
                textAlignVertical: 'bottom'
            },
            sup: {
                color: GlobalColors.chatTextColor,
                position: 'relative',
                fontSize: 8,
                textAlignVertical: 'top'
            },
            a: {
                flexWrap: 'wrap'
            },
            code: {
                color: 'pink'
            }
        }),
        [GlobalColors.chatTextColor]
    );
    const TextViewComponent = ({ displayMessage }) => (
        <View style={[styles.textMsgWrapper]}>
            <RenderHTML
                contentWidth={widthForContent}
                systemFonts={['Figtree-Light']}
                renderersProps={{
                    a: {
                        onPress: (event, href) => {
                            utils.openURL(href);
                        }
                    }
                }}
                baseStyle={{
                    fontFamily: 'Figtree-Light',
                    fontSize: 14,
                    color: GlobalColors.chatTextColor,
                    fontWeight: AppFonts.LIGHT
                }}
                tagsStyles={tagsStyles}
                source={{
                    html: `<html><body>${displayMessage}</body></html>`
                }}
            />
        </View>
    );
    return (
        <View style={{ flexDirection: 'row' }} key={message.getMessageId()}>
            <View
                style={[
                    chatMessageBubbleStyle(showTime),
                    {
                        marginLeft: 48
                    }
                ]}
            >
                {canCopyPaste ? (
                    <Pressable
                        style={({ pressed }) => [
                            { opacity: pressed ? 0.3 : 1 }
                        ]}
                        onLongPress={() => {
                            Clipboard.setString(text);
                            Toast.show({
                                text1: 'Copied successfully!',
                                type: 'success'
                            });
                        }}
                    >
                        <TextViewComponent displayMessage={displayMessage} />
                    </Pressable>
                ) : (
                    <TextViewComponent displayMessage={displayMessage} />
                )}
            </View>
            {user !== undefined &&
            message.getCreatedBy() === user.userId &&
            (message.getStatus() === 1 || message.getStatus() === -1) ? (
                <View style={styles.textMsgDeliveryICon}>
                    {message.getStatus() === 1
                        ? Icons.delivered()
                        : Icons.deliveryFailed()}
                </View>
            ) : (
                <Text />
            )}
        </View>
    );
};
TextComponent.whyDidYouRender = { name: 'TextComponent' };

export default TextComponent;
