import { StyleSheet, Platform } from 'react-native';
import { GlobalColors } from '../../config/styles';
import { ButtonStyle } from '../../lib/capability';

export const FONT_SIZE = 16;

export const styles = StyleSheet.create({
    title: {
        color: GlobalColors.black,
        fontSize: 15,
        fontWeight: 'bold',
        marginTop: 21,
        marginHorizontal: 33,
        textAlign: 'center'
    },
    body: {
        color: GlobalColors.black,
        fontSize: 15,
        marginTop: 21,
        marginHorizontal: 33,
        textAlign: 'center'
    },
    button: {
        minWidth: 150,
        borderColor: GlobalColors.tabBackground,
        borderWidth: 1,
        borderRadius: 8,
        paddingVertical: 7,
        paddingHorizontal: 10
    },
    buttonBright: {
        backgroundColor: GlobalColors.tabBackground
    },
    buttonLight: {
        backgroundColor: GlobalColors.white
    },
    buttons: {
        marginVertical: 15,
        alignSelf: 'center'
    },
    container: {
        backgroundColor: GlobalColors.white,
        marginTop: 20
    }
});

export function buttonStyle(style) {
    if (style === ButtonStyle.bright) {
        return [styles.button, styles.buttonBright];
    } else {
        return [styles.button, styles.buttonLight];
    }
}

export function fontColor(style) {
    if (style === ButtonStyle.bright) {
        return GlobalColors.white;
    } else {
        return GlobalColors.tabBackground;
    }
}
