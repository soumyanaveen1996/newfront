import React from 'react';
import { View, Text, Image } from 'react-native';
import images from '../../config/images';
import { NetworkStatusNotchBar } from '../NetworkStatusBar';

export default class EmptyInstalledBot extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <View
                style={{
                    flex: 1,
                    flexDirection: 'column'
                }}
            >
                {this.props.noNetwork ? <NetworkStatusNotchBar /> : null}
                <View
                    style={{
                        flex: 1,
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <Image
                        style={{ marginBottom: 45, width: 200 }}
                        source={images.empty_marketplace}
                    />
                    <View
                        style={{
                            width: 200,
                            fontSize: 14,
                            fontWeight: '100',
                            fontFamily: 'SF Pro Text Thin',
                            textAlign: 'center',
                            alignItems: 'center'
                        }}
                    >
                        <Text
                            style={{ textAlign: 'center', alignSelf: 'center' }}
                            numberOfLines={3}
                        >
                            You don’t have any app installed. Search or sign in
                            to a new provider.
                        </Text>
                    </View>
                </View>
            </View>
        );
    }
}
