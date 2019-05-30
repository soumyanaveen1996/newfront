import { StyleSheet } from 'react-native';
import { GlobalColors } from '../../config/styles';
import { Platform } from 'react-native';
import { SCREEN_HEIGHT } from './config';
import { SCREEN_WIDTH } from './config';

export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: GlobalColors.white
    },
    logoHeader: {
        width: SCREEN_WIDTH,
        backgroundColor: GlobalColors.white,
        height: 45,
        borderStyle: 'solid',
        borderBottomColor: 'rgb(192, 192, 192)',
        borderBottomWidth: 1,
        alignItems: 'center',
        justifyContent: 'center'
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
    signupHeader: {
        fontSize: 28,
        color: 'rgba(74,74,74,1)',
        fontWeight: '300'
    },
    signupSubHeader: {
        fontSize: 20,
        color: 'rgba(74,74,74,1)',
        fontWeight: '300'
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
        marginBottom: 10
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
    buttonText: {
        color: '#fff',
        fontSize: 16,
        textAlign: 'center',
        fontWeight: '700'
    },
    loginButton: {
        backgroundColor: '#2980b6',
        color: '#fff'
    },
    criteriaWrapper: {
        flexDirection: 'row',
        alignItems: 'center'
    },
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
    errorContainer: Platform.select({
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
    userError: Platform.select({
        ios: {
            backgroundColor: 'rgba(229,69,59,1)',
            zIndex: 999999,
            minWidth: 150,
            padding: 5,
            borderTopRightRadius: 10,
            borderBottomLeftRadius: 10,
            borderBottomRightRadius: 10,
            borderTopLeftRadius: 0,
            alignItems: 'center'
        },
        android: {
            backgroundColor: 'rgba(229,69,59,1)',
            minWidth: 150,
            padding: 5,
            borderTopRightRadius: 10,
            borderBottomLeftRadius: 10,
            borderBottomRightRadius: 10,
            borderTopLeftRadius: 0,
            alignItems: 'center'
        }
    }),
    errorText: Platform.select({
        ios: {
            color: '#ffffff',
            textAlign: 'center'
        },
        android: {
            color: '#ffffff',
            textAlign: 'center'
        }
    }),
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
    goToLine: Platform.select({
        ios: {
            marginTop: 5,
            height: 20,
            color: 'rgba(0,189,242,1)',
            fontSize: 14,
            letterSpacing: 1,
            lineHeight: 20,
            fontWeight: 'bold',
            justifyContent: 'center',
            alignItems: 'center'
        },
        android: {
            marginTop: 5,
            width: '100%',
            textAlign: 'center',
            color: 'rgba(0,189,242,1)',
            fontSize: 14,
            letterSpacing: 1,
            lineHeight: 20,
            fontWeight: 'bold',
            justifyContent: 'center',
            alignItems: 'center'
        }
    }),
    bottomMargin: {
        width: SCREEN_WIDTH,
        backgroundColor: GlobalColors.white,
        height: 80,
        borderStyle: 'solid',
        borderTopColor: 'rgb(192, 192, 192)',
        borderTopWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10
    },
    dotSider: {
        flex: 1,
        alignItems: 'center'
    },
    innerWidth: {
        width: 55,
        height: 10,
        flexDirection: 'row',
        alignItems: 'center'
    },
    dotSize: {
        width: 5,
        height: 5,
        marginLeft: 3,
        marginRight: 3,
        marginTop: 3,
        marginBottom: 3
    },
    lastDotSize: {
        width: 8,
        height: 8,
        marginLeft: 3,
        marginRight: 3,
        marginTop: 3,
        marginBottom: 3
    }
});
