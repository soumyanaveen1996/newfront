import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import styles from '../styles';
import images from '../../../config/images';
import { BackgroundImage } from '../BackgroundImage';
import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp
} from 'react-native-responsive-screen';
import GlobalColors from '../../../config/styles';
import { Actions } from 'react-native-router-flux';
import AppFonts from '../../../config/fontConfig';

export default EmptyContact = (props) => (
    // <BackgroundImage style={{ flex: 1 }}>
    <View
        style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center'
        }}
    >
        {props.showNoContactIcon ? (
            <View
                style={{
                    width: 200,
                    fontSize: 14,
                    fontWeight: AppFonts.THIN,
                    textAlign: 'center',
                    alignItems: 'center'
                }}
            >
                <Image
                    style={{ marginBottom: 45, width: 200 }}
                    source={images.empty_contact}
                />
                <Text
                    style={{ textAlign: 'center', alignSelf: 'center' }}
                    numberOfLines={2}
                >
                    {props.showMessage || 'You have no contacts yet.'}
                </Text>
            </View>
        ) : null}
        {/*{props.showAddContactsOption && (*/}
        {/*    <TouchableOpacity*/}
        {/*        style={{*/}
        {/*            backgroundColor: '#2D9CDB',*/}
        {/*            borderRadius: 5,*/}
        {/*            height: 40,*/}
        {/*            width: wp('70%'),*/}
        {/*            display: 'flex',*/}
        {/*            flexDirection: 'row',*/}
        {/*            alignItems: 'center',*/}
        {/*            justifyContent: 'center',*/}
        {/*            marginTop: 20*/}
        {/*        }}*/}
        {/*        onPress={props.inviteUser}*/}
        {/*    >*/}
        {/*        /!* <Image*/}
        {/*                        source={require('../../images/contact/new-contact-icon.png')}*/}
        {/*                        style={{*/}
        {/*                            height: 20,*/}
        {/*                            width: 20,*/}
        {/*                            resizeMode: 'contain'*/}
        {/*                        }}*/}
        {/*                    /> *!/*/}
        {/*        <Text*/}
        {/*            style={{*/}
        {/*                color: GlobalColors.white,*/}
        {/*                marginLeft: 5*/}
        {/*            }}*/}
        {/*        >*/}
        {/*            Add Contacts*/}
        {/*        </Text>*/}
        {/*    </TouchableOpacity>*/}
        {/*)}*/}
    </View>
);
