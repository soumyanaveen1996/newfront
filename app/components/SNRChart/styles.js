import { StyleSheet } from 'react-native';
import { GlobalColors } from '../../config/styles';

export const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        backgroundColor: GlobalColors.white,
        justifyContent: 'center',
        paddingLeft: 20,
        paddingRight: 20,
        flex: 1
    },
    text: {
        fontSize: 18,
        marginTop: 10,
        color: GlobalColors.white
    },
});


export const chartStyles = {
    axis: {
        axis: {
            stroke: 'rgba(0, 122, 255, 0.5)',
            strokeWidth: 2
        },
        axisLabel: {
            fill: GlobalColors.accent,
            stroke: 'none',
            fontSize: 15,
        },
        tickLabels: {
            fill: GlobalColors.accent,
            stroke: 'none',
            fontSize: 10,
        }
    },
    line: {
        data: {
            stroke: GlobalColors.iosBlue,
            strokeWidth: 2
        }
    }
};


export default {
    styles: styles,
    chartStyles: chartStyles,
}
