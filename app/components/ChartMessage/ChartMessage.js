import React from 'react';
import { View, Text, Image } from 'react-native';
import Svg, {
    Circle,
    Ellipse,
    G,
    Text as svgText,
    TSpan,
    TextPath,
    Path,
    Polygon,
    Polyline,
    Line,
    Rect,
    Use,
    Symbol,
    Defs,
    LinearGradient,
    RadialGradient,
    Stop,
    ClipPath,
    Pattern,
    Mask
} from 'react-native-svg';
import styles from './styles';
import GlobalColors from '../../config/styles';

export default class ChartMessage extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <View style={styles.container}>
                <View style={styles.topBarContainer}>
                    <View style={styles.topBarTextContainer}>
                        <Text style={styles.title}>
                            {this.props.chartOptions.title}
                        </Text>
                        <Text style={styles.description}>
                            {this.props.chartOptions.description}
                        </Text>
                    </View>
                    <Image />
                </View>
                <View style={styles.chartContainer}>
                    <Svg height="100%" width="100%" viewBox="0 0 100 100">
                        <Line
                            x1="0"
                            y1="50"
                            x2="100"
                            y2="50"
                            stroke={GlobalColors.disabledGray}
                            strokeWidth="2"
                        />
                    </Svg>
                </View>
                {/* <View style={styles.bottomBarContiner}>

                </View> */}
            </View>
        );
    }
}
