import React from 'react';
import { TouchableOpacity, Image, Text } from 'react-native';

class DialPadButton extends React.Component {
    onClickDialpad = () => {
        Actions.dialCall();
    };
    render() {
        return (
            <TouchableOpacity
                style={{
                    position: 'absolute',
                    width: 160,
                    height: 40,
                    backgroundColor: 'rgba(47,199,111,1)',
                    borderRadius: 20,
                    justifyContent: 'center',
                    alignItems: 'center',
                    flexDirection: 'row',
                    bottom: '5%',
                    alignSelf: 'center'
                }}
                onPress={() => this.onClickDialpad()}
            >
                <Image
                    style={{ width: 11, height: 16, marginRight: 10 }}
                    source={require('../../images/contact/tab-dialpad-icon-active.png')}
                />
                <Text style={{ color: '#fff' }}>DialPad</Text>
            </TouchableOpacity>
        );
    }
}

export default DialPadButton;
