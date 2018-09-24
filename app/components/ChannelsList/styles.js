import { StyleSheet } from 'react-native';
import { SCREEN_WIDTH, scrollViewConfig } from './config';
import { GlobalColors } from '../../config/styles';

export const ChannelsListItemColors = {
    titleColor: 'rgb(255, 82, 59)',
    subTitleColor: 'rgb(71, 72, 78)',
    dateColor: 'rgb(142, 142, 142)',
    backgroundColor: GlobalColors.white,
    countColor: 'rgb(62,137,252)',
    countTextColor: GlobalColors.white,
    button: GlobalColors.iosBlue
};

export default StyleSheet.create({
    tileContainer: {
        width: scrollViewConfig.width * 0.5,
        height: SCREEN_WIDTH * 0.5,
        borderWidth: 4,
        borderTopWidth: 8,
        borderBottomWidth: 2,
        borderColor: 'transparent',
        borderRadius: 15
    },

    rowContainer: {
        width: SCREEN_WIDTH,
        height: 105,
        borderBottomWidth: 1,
        borderColor: 'transparent',
        borderRadius: 15
    },
    rowContent: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: 'white'
    },
    avatarContainerStyle: {
        height: 50,
        width: 40
    },
    avatarStyle: {
        height: 40,
        width: 30
    },
    containerStyle: {
        height: 100,
        borderBottomColor: 'transparent',
        justifyContent: 'center'
    },
    titleStyle: {
        fontWeight: 'bold',
        color: GlobalColors.red,
        fontSize: 15
    },
    titleContainerStyle: {
        paddingLeft: 5
    },
    subtitleStyle: {
        fontWeight: '400',
        fontSize: 13
    },
    avatarOverlayContainerStyle: {
        backgroundColor: 'transparent'
    },
    subtitleContainerStyle: {
        padding: 5
    },
    gridStyle: {
        flex: 1
    },
    headerTitleStyle: {
        fontSize: 17,
        color: GlobalColors.white,
        fontWeight: '500'
    },

    headerOuterContainerStyles: {
        position: 'relative',
        borderBottomColor: GlobalColors.accent
    },
    headerinnerContainerForSearch: {
        marginTop: 50
    },
    flatList: {
        height: '100%'
    },
    container: {
        flex: 1,
        flexDirection: 'row',
        paddingHorizontal: 10,
        paddingVertical: 24,
        alignItems: 'stretch',
        backgroundColor: ChannelsListItemColors.backgroundColor
    },
    title: {
        color: ChannelsListItemColors.titleColor,
        fontSize: 15,
        fontWeight: 'bold'
    },
    subTitle: {
        color: ChannelsListItemColors.subTitleColor,
        fontSize: 15,
        marginTop: 5
    },
    image: {
        height: 40,
        width: 40,
        marginTop: 5
    },
    textContainer: {
        flex: 1,
        marginHorizontal: 10
    },
    rightContainer: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        alignContent: 'center',
        marginLeft: 20
    },
    hidden: {
        display: 'none'
    },
    chatImage: {
        marginTop: 5,
        borderRadius: 7,
        overflow: 'hidden',
        width: 40,
        height: 40
    },
    installButtonText: {
        color: ChannelsListItemColors.button,
        fontSize: 12,
        padding: 3
    }
});
