import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import styles from './styles';
import images from '../../config/images';
import { BackgroundImage } from '../BackgroundImage';
import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp
} from 'react-native-responsive-screen';
import { GlobalColors } from '../../config/styles';
import { Actions } from 'react-native-router-flux';

export default class EmptyContact extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <BackgroundImage style={{ flex: 1 }}>
                <View
                    style={{
                        flex: 1,
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <Image
                        style={{ marginBottom: 45, width: 200 }}
                        source={images.empty_contact}
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
                            numberOfLines={2}
                        >
                            You have no contacts yet.
                        </Text>
                    </View>

                    {Actions.currentScene !== 'phoneContactsCall' && (
                        <TouchableOpacity
                            style={{
                                backgroundColor: 'rgba(47,199,111,1)',
                                borderRadius: 5,
                                height: 40,
                                width: wp('40%'),
                                display: 'flex',
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginTop: 20
                            }}
                            onPress={this.props.inviteUser}
                        >
                            <Image
                                source={require('../../images/contact/new-contact-icon.png')}
                                style={{
                                    height: 20,
                                    width: 20,
                                    resizeMode: 'contain'
                                }}
                            />
                            <Text
                                style={{
                                    color: GlobalColors.white,
                                    marginLeft: 5
                                }}
                            >
                                Add Contacts
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>
            </BackgroundImage>
        );
    }
}
