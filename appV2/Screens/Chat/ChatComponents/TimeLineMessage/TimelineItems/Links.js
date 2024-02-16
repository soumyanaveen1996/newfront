import React from 'react';
import { Text, View, Linking } from 'react-native';
import GlobalColors from '../../../../../config/styles';
import { LinkPreview } from '@flyerhq/react-native-link-preview';
import TextLessMoreView from '../../Widgets/TextWithReadMore';

export default Links = ({ links = [], text = null }) => {
    const linktexts = [];
    for (let i = 0; i < links.length - 1; i++) {
        linktexts.push(
            <Text
                style={{ marginHorizontal: 10 }}
                onPress={() => Linking.openURL(links[i])}
            >
                {links[i]}
            </Text>
        );
    }
    return (
        <View style={{ flex: 1 }}>
            {text && (
                <View style={{ paddingHorizontal: 10, marginBottom: 4 }}>
                    <TextLessMoreView text={text} targetLines={2} />
                </View>
            )}
            {linktexts}
            <LinkPreview
                text={links[links.length - 1]}
                textContainerStyle={{
                    marginHorizontal: 10
                }}
                metadataContainerStyle={{
                    marginTop: 2,
                    shadowColor: 'red',
                    borderColor: GlobalColors.disabledGray,
                    borderWidth: 1,
                    borderRadius: 4,
                    padding: 4
                }}
            />
        </View>
    );
};
