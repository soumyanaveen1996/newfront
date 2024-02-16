import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import images from '../../../../config/images';
import { NetworkStatusNotchBar } from '../../../../widgets/NetworkStatusBar';
import GlobalColors from '../../../../config/styles';
import AppFonts from '../../../../config/fontConfig';

export default class EmptyInstalledBot extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <View
                style={{
                    flex: 1,
                    marginTop: '50%'
                }}
            >
                {this.props.noNetwork && <NetworkStatusNotchBar />}
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
                            fontWeight: AppFonts.THIN,
                            textAlign: 'center',
                            alignItems: 'center'
                        }}
                    >
                        <Text
                            style={{
                                textAlign: 'center',
                                alignSelf: 'center',
                                color: GlobalColors.primaryTextColor
                            }}
                            numberOfLines={3}
                        >
                            {this.props.noNetwork
                                ? 'Slow or no internet connection. Please check your internet settings and try again.'
                                : 'You don’t have any App installed'}
                        </Text>
                    </View>
                    {this.props.noNetwork ? null : (
                        <TouchableOpacity
                            style={{
                                marginTop: 20,
                                height: 35,
                                backgroundColor: GlobalColors.frontmLightBlue,
                                width: '80%',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: 8,
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
                                Install First App
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        );
    }
}
