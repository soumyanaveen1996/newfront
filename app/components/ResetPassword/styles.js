import { StyleSheet } from 'react-native';
import { GlobalColors } from '../../config/styles';
import { Platform } from 'react-native';
import { SCREEN_HEIGHT } from './config';
import { SCREEN_WIDTH } from './config';

export default StyleSheet.create({
    safeAreaView: {
        flex: 1,
        backgroundColor: 'rgba(255,255,255,1)'
    },

    loginScreenView: {
        position: 'absolute',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 40,
        bottom: 60
    },
    loginScreenText: {
        color: 'rgba(0, 189, 242, 1)',
        fontSize: 14,
        marginRight: 10
    },
    arrow: Platform.select({
        android: {
            width: 15,
            height: 10
        },
        ios: {
            width: 15,
            height: 10
        }
    }),
    containerReset: {
        flex: 1
    },
    container: {
        flexDirection: 'column',
        marginTop: 100,
        textAlign: 'center',
        alignItems: 'center',
        justifyContent: 'center'
    },
    headerText: {
        color: 'rgba(74,74,74,1)',
        fontSize: 30,
        marginBottom: 24
    },
    descriptionContainer: {
        width: SCREEN_WIDTH - 80,
        textAlign: 'center',
        paddingHorizontal: 10,
        marginBottom: 60
    },
    descriptionText: {
        textAlign: 'center',
        color: 'rgba(102,102,102,1)'
    },
    input: {
        height: 40,
        width: 300,
        backgroundColor: 'rgba(244,244,244,1)',
        padding: 10,
        color: 'rgba(0,0,0,0.8)',
        fontSize: 16,
        borderTopRightRadius: 0,
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10,
        borderTopLeftRadius: 10
    },
    buttonContainer: {
        height: 40,
        width: 300,
        backgroundColor: 'rgba(0,189,242,1)',
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 25
    },
    buttonText: {
        color: '#fff',
        textAlign: 'center',
        fontSize: 16,
        fontWeight: '500'
    },
    errorContainer: Platform.select({
        ios: {
            position: 'absolute',
            minWidth: 180,
            bottom: -30,
            right: 0
        },
        android: {
            minWidth: 180,
            flex: 1,
            alignItems: 'flex-end'
        }
    }),
    userError: Platform.select({
        ios: {
            backgroundColor: 'rgba(229,69,59,1)',
            zIndex: 999999,
            minWidth: 180,
            borderTopRightRadius: 10,
            borderBottomLeftRadius: 10,
            borderBottomRightRadius: 10,
            borderTopLeftRadius: 0,
            alignItems: 'center'
        },
        android: {
            backgroundColor: 'rgba(229,69,59,1)',
            width: 180,
            borderTopRightRadius: 10,
            borderBottomLeftRadius: 10,
            borderBottomRightRadius: 10,
            borderTopLeftRadius: 0,
            alignItems: 'center'
        }
    }),
    errorText: {
        color: '#ffffff',
        textAlign: 'center',
        padding: 6
    },
    keyboardConatiner: {
        flex: 1
    },
    headerContainer: {
        flex: 1,
        height: 80,
        marginTop: '2%',
        alignItems: 'center',
        textAlign: 'center'
    },
    formContainer: Platform.select({
        ios: {
            padding: 10,
            marginBottom: 20,
            alignItems: 'center',
            justifyContent: 'center'
        },
        android: {
            padding: 10,
            marginBottom: 20,
            alignItems: 'center',
            justifyContent: 'center'
        }
    }),
    placeholderText: {
        fontWeight: '300',
        color: 'rgba(74,74,74,1)',
        width: 300,
        padding: 4,
        letterSpacing: 1,
        lineHeight: 20,
        fontSize: 14,
        marginTop: 20
    },
    entryFields: Platform.select({
        ios: {
            position: 'relative',
            width: 300,
            backgroundColor: 'transparent'
        },
        android: {
            width: 300,
            backgroundColor: 'transparent'
        }
    }),
    passwordText: {
        color: 'rgba(74,74,74,1)',
        fontSize: 14,
        fontWeight: '500',
        letterSpacing: 1,
        lineHeight: 16,
        marginBottom: 5
    },
    passwordCriteriaList: {
        color: 'rgba(74,74,74,1)',
        fontSize: 14,
        fontWeight: '300',
        letterSpacing: 1,
        lineHeight: 28
    },
    diableButton: {
        height: 40,
        width: 300,
        backgroundColor: 'rgba(155,155,155,1);',
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10
    },
    successContainer: Platform.select({
        ios: {
            position: 'absolute',
            bottom: -30,
            right: 0
        },
        android: {
            flex: 1,
            alignItems: 'flex-end'
        }
    }),
    userSuccess: Platform.select({
        ios: {
            backgroundColor: 'rgba(47,199,111,1)',
            zIndex: 999999,
            width: 150,
            padding: 5,
            borderTopRightRadius: 10,
            borderBottomLeftRadius: 10,
            borderBottomRightRadius: 10,
            borderTopLeftRadius: 0,
            alignItems: 'center'
        },
        android: {
            backgroundColor: 'rgba(47,199,111,1)',
            width: 150,
            padding: 5,
            borderTopRightRadius: 10,
            borderBottomLeftRadius: 10,
            borderBottomRightRadius: 10,
            borderTopLeftRadius: 0,
            alignItems: 'center'
        }
    }),
    successText: Platform.select({
        ios: {
            color: '#ffffff',
            textAlign: 'center'
        },
        android: {
            color: '#ffffff',
            textAlign: 'center'
        }
    }),
    pinCodeWithPassword: {
        flex: 1,
        alignItems: 'center',
        marginBottom: 5,
        marginTop: 10,
        justifyContent: 'center'
    },
    pinCode: {
        flex: 1,
        alignItems: 'center',
        marginBottom: 60,
        marginTop: 10,
        justifyContent: 'center'
    },

    textInput: Platform.select({
        ios: {
            height: 40,
            width: 300,
            backgroundColor: 'rgba(244,244,244,1)',
            padding: 10,
            textAlign: 'center',
            color: 'rgba(0,0,0,0.8)',
            fontSize: 16,
            borderTopRightRadius: 0,
            borderBottomLeftRadius: 10,
            borderBottomRightRadius: 10,
            borderTopLeftRadius: 10,
            letterSpacing: 2
        },
        android: {
            height: 40,
            width: 300,
            backgroundColor: 'rgba(244,244,244,1)',
            padding: 10,
            color: 'rgba(0,0,0,0.8)',
            fontSize: 16,
            borderTopRightRadius: 0,
            borderBottomLeftRadius: 10,
            borderBottomRightRadius: 10,
            borderTopLeftRadius: 10,
            letterSpacing: 2
        }
    })
});
