import { Platform, StyleSheet, Dimensions } from 'react-native';
import { GlobalColors } from '../../config/styles';
import { ButtonStyle } from '../../lib/capability';

export default (stylesheet = StyleSheet.create({
    //MESSAGE
    container: {
        marginLeft: '10%',
        marginTop: 20,
        width: '80%',
        padding: 20,
        flexDirection: 'column',
        alignItems: 'stretch',
        backgroundColor: GlobalColors.white,
        borderRadius: 10,
        borderWidth: 0.2,
        shadowColor: 'black',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.08,
        shadowRadius: 4
    },
    topArea: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderColor: GlobalColors.disabledGray
    },
    title: {
        fontSize: 18,
        color: GlobalColors.headerBlack
    },
    description: {
        fontSize: 12,
        color: GlobalColors.darkGray,
        paddingVertical: 12
    },
    button: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 8,
        backgroundColor: GlobalColors.sideButtons,
        borderRadius: 5
    },
    buttonText: {
        fontSize: 16,
        color: GlobalColors.white
    },

    //FORM
    f2Container: {},
    f2Title: {},
    f2FieldContainer: {},
    f2LabelTitle: {},
    f2BottomArea: {},
    f2CancelButton: {},
    f2CancelButtonText: {},
    f2DoneButton: {},
    f2DoneButtonText: {},

    //FORM FIELDS

    //MODALS
    dateModalIOS: {
        justifyContent: 'flex-end',
        margin: 0
    },
    datePickerIOS: {
        backgroundColor: GlobalColors.white,
        height: '35%',
        width: '100%'
    }
}));
