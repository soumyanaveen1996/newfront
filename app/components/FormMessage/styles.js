import { StyleSheet } from 'react-native';
import { GlobalColors } from '../../config/styles'

const stylesheet = StyleSheet.create({

    buttonMsgParent: {
        flexDirection: 'column',
        marginTop: 20,
        width: 200
    },
    buttonMessage: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'stretch',
        borderWidth: 1,
        borderColor: GlobalColors.botChatBubbleColor,
        padding: 10,
        borderRadius: 10
    },
    inputStyle: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        color: GlobalColors.black
    },
    formTextMsg: {
        color: GlobalColors.black
    }
});

export default stylesheet;
