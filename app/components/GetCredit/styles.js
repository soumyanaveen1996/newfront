import { Platform, StyleSheet, Dimensions } from 'react-native';
import { GlobalColors } from '../../config/styles';

const screenSize = {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height
};

const buttonSize = screenSize.width * 0.25;

export default (stylesheet = StyleSheet.create({
    modal: {
        justifyContent: 'center',
        alignItems: 'center',
        margin: 0
    },
    container: {
        height: '100%',
        width: '100%',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'stretch',
        paddingTop: '10%',
        backgroundColor: GlobalColors.white
    },
    topContainer: {
        height: '70%',
        width: '100%',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'stretch',
        paddingTop: '10%'
    },
    title: {
        fontSize: 24,
        alignSelf: 'center',
        marginBottom: 20,
        color: GlobalColors.textBlack
    },
    balance: {
        fontSize: 38,
        alignSelf: 'center',
        fontWeight: '600',
        color: GlobalColors.frontmLightBlue
    },
    creditContainer: {},
    creditRow: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignItems: 'center',
        marginBottom: 25
    },
    creditButton: {
        width: buttonSize,
        height: buttonSize,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 5,
        borderRadius: buttonSize * 0.5,
        borderWidth: 1,
        borderColor: GlobalColors.frontmLightBlue,
        backgroundColor: GlobalColors.white
    },
    creditButtonSelected: {
        width: buttonSize,
        height: buttonSize,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 5,
        borderRadius: buttonSize * 0.5,
        borderWidth: 1,
        borderColor: GlobalColors.frontmLightBlue,
        backgroundColor: GlobalColors.frontmLightBlue
    },
    creditButtonText: {
        fontSize: 20,
        fontWeight: '600',
        color: GlobalColors.textBlack
    },
    creditButtonTextSelected: {
        fontSize: 20,
        fontWeight: '600',
        color: GlobalColors.white
    },
    currency: {
        fontSize: 12,
        fontWeight: '100'
    },
    buyButton: {
        alignSelf: 'center',
        width: '75%',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 10,
        marginVertical: 20,
        borderRadius: 10,
        backgroundColor: GlobalColors.frontmLightBlue
    },
    buyButtonDisabled: {
        alignSelf: 'center',
        width: '75%',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 10,
        marginVertical: 20,
        borderRadius: 10,
        backgroundColor: GlobalColors.frontmLightBlue,
        opacity: 0.2
    },
    buyButtonText: {
        fontSize: 20,
        color: GlobalColors.white
    }
}));
