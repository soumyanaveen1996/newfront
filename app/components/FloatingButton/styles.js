import { StyleSheet } from 'react-native';
import { GlobalColors } from '../../config/styles';

const Styles = StyleSheet.create({
    overlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        top: 0,
        backgroundColor: GlobalColors.transparent
    },
    buttonText: {
        marginTop: -4,
        fontSize: 32,
        fontWeight: '300',
        color: GlobalColors.white
    },
    orientation: {
        alignItems: 'flex-end'
    },
    itemButton: {
        justifyContent: 'center',
        alignItems: 'center',
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: GlobalColors.accent
    },
    mainButton: {
        justifyContent: 'center',
        alignItems: 'center',
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: GlobalColors.orangeYellow
    },
    itemContainer: {
        paddingHorizontal: 20,
        height: 80,
        flexDirection: 'row-reverse',
        alignItems: 'center'
    },
    itemTextContainer: {
        paddingHorizontal: 20,
        height: '100%',
        flexDirection: 'column',
        justifyContent: 'center'
    },
    itemText: {
        fontSize: 16,
        fontWeight: '500',
        color: GlobalColors.white
    },
    itemImage: {
        width: 56,
        height: 56
    },
    mainButtonContainer: {
        paddingHorizontal: 20,
        height: 80,
        flexDirection: 'column',
        justifyContent: 'center',
        paddingBottom: 12
    }
});

export function itemAnimatedViewStyle(anim) {
    return [
        {
            marginBottom: -10,
            alignItems: 'flex-end',
            opacity: anim,
            transform: [
                {
                    translateY: anim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [40, 0]
                    })
                }
            ]
        }
    ];
}

export function mainButtonAnimatedViewStyle(anim) {
    return {
        transform: [
            {
                scale: anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 1]
                })
            },
            {
                rotate: anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', 45 + 'deg']
                })
            }
        ]
    };
}

export function overlayTappableStyle(props) {
    return [
        Styles.overlay,
        {
            elevation: props.elevation,
            zIndex: props.zIndex,
            justifyContent: 'flex-end',
            backgroundColor: GlobalColors.modalBackground
        }
    ];
}

export function overlayStyle(props) {
    return [
        Styles.overlay,
        {
            elevation: props.elevation,
            zIndex: props.zIndex,
            justifyContent: 'flex-end'
        }
    ];
}

export function actionStyle(props) {
    return {
        flex: 1,
        alignSelf: 'stretch',
        justifyContent: 'flex-end',
        paddingTop: 0,
        zIndex: props.zIndex
    };
}

export default Styles;
