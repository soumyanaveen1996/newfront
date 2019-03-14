import GlobalColors from '../config/styles';

export default {
    navBar: {
        headerStyle: {
            backgroundColor: GlobalColors.white,
            shadowOpacity: 0
        },
        noConnectionStyle: {
            backgroundColor: GlobalColors.disabledButton,
            shadowOpacity: 0
        },
        satelliteStyle: {
            backgroundColor: GlobalColors.satelliteMode,
            shadowOpacity: 0
        },
        borderlessHeaderStyle: {
            backgroundColor: GlobalColors.white,
            shadowOpacity: 0,
            borderBottomWidth: 1,
            borderBottomColor: GlobalColors.background
        },
        navigationBarTintColor: GlobalColors.headerBlack,
        titleStyle: {
            fontFamily: 'SF Pro Text',
            fontSize: 16,
            fontWeight: '400',
            color: 'red'
        }
    }
};
