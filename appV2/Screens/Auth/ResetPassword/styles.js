import { StyleSheet, Platform } from 'react-native';
import GlobalColors from '../../../config/styles';

import { SCREEN_HEIGHT, SCREEN_WIDTH } from './config';
import AppFonts from '../../../config/fontConfig';

export default StyleSheet.create({
    safeAreaView: {
        flex: 1,
        backgroundColor: GlobalColors.contentBackgroundColor
    },

    loginScreenView: {
        flexDirection: 'row',
        alignItems: 'center',
        textAlign: 'center',
        justifyContent: 'center',
        width: SCREEN_WIDTH,
        height: 40
    },
    loginScreenText: {
        color: GlobalColors.frontmLightBlue,
        alignItems: 'center',
        textAlign: 'center',
        fontSize: 14,
        marginRight: 10
    },
    arrow: {
        width: 15,
        height: 10,
        tintColor: GlobalColors.frontmLightBlue
    },
    containerReset: {
        flex: 1
    },
    container: {
        flex: 1,
        flexDirection: 'column',
        textAlign: 'center',
        alignItems: 'center',
        paddingVertical: 100,
        justifyContent: 'center'
    },
    headerText: {
        color: GlobalColors.primaryTextColor,
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
        color: GlobalColors.chatSubTitle,
        textAlign: 'center'
    },
    input: {
        height: 40,
        width: 300,
        padding: 10,
        color: GlobalColors.formText,
        fontSize: 16,
        backgroundColor: GlobalColors.formItemBackgroundColor,
        borderRadius: 6,
        borderColor: GlobalColors.appBackground,
        borderWidth: 1
    },
    buttonContainer: {
        height: 40,
        width: 300,
        backgroundColor: GlobalColors.primaryButtonColor,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center'
    },
    buttonText: {
        color: GlobalColors.primaryButtonText,
        textAlign: 'center',
        fontSize: 16,
        fontWeight: AppFonts.NORMAL
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
        fontWeight: AppFonts.LIGHT,
        color: GlobalColors.formLable,
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
        color: GlobalColors.primaryTextColor,
        fontSize: 14,
        fontWeight: AppFonts.NORMAL,
        letterSpacing: 1,
        lineHeight: 16,
        marginBottom: 5
    },
    passwordCriteriaList: {
        color: GlobalColors.primaryTextColor,
        fontSize: 14,
        fontWeight: AppFonts.LIGHT,
        letterSpacing: 1,
        lineHeight: 28
    },
    diableButton: {
        height: 40,
        width: 300,
        backgroundColor: GlobalColors.primaryButtonColorDisabled,
        borderRadius: 20,
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

    textInput: {
        height: 40,
        width: 300,
        padding: 10,
        textAlign: 'center',
        color: GlobalColors.formText,
        fontSize: 16,
        backgroundColor: GlobalColors.formItemBackgroundColor,
        borderRadius: 6,
        letterSpacing: 2
    }
});
