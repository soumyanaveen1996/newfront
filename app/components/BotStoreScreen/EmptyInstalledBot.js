import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
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
                        source={
                            this.props.noNetwork
                                ? images.empty_state_connection
                                : images.empty_marketplace
                        }
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
                            {this.props.noNetwork
                                ? 'Slow or not internet connection. Please check your internet settings and try again.'
                                : 'You don’t have any Assistant installed'}
                        </Text>
                    </View>
                    {this.props.noNetwork ? null : (
                        <TouchableOpacity
                            style={{
                                marginTop: 20,
                                height: 35,
                                backgroundColor: 'rgba(0,189,242,1)',
                                width: '80%',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: 8,
                                borderWidth: 1,
                                borderColor: 'white'
                            }}
                            onPress={this.props.goHome}
                        >
                            <Text
                                style={{
                                    display: 'flex',
                                    color: 'white',
                                    fontSize: 16
                                }}
                            >
                                Install First Assistant
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        );
    }
}
