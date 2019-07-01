import React from 'react';
import { View, Image, Text as ReactText } from 'react-native';
import Svg, {
    Circle,
    Ellipse,
    G,
    Text,
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
import _ from 'lodash';
import Icons from '../../config/icons';

export default class ChartMessage extends React.Component {
    constructor(props) {
        super(props);
        this.delta = this.props.chartOptions.delta || 10;
        this.minValue =
            this.props.chartOptions.minValue ||
            _.minBy(this.props.chartData, 'y');
        this.maxValue =
            this.props.chartOptions.maxValue ||
            _.maxBy(this.props.chartData, 'y');
        this.minValue = this.minValue.y - this.delta;
        this.maxValue = this.maxValue.y + this.delta;
    }

    componentDidMount() {}

    renderHorizontalGrid() {
        let horizontalLines = [];
        for (
            let index = this.minValue;
            index < this.maxValue;
            index = index + this.delta
        ) {
            horizontalLines.push(index);
        }
        horizontalLines.reverse();
        return horizontalLines.map(value => {
            return (
                <G y={100 - (value * 100) / this.maxValue}>
                    <Text
                        fill={GlobalColors.textBlack}
                        fontSize="3"
                        fontWeight="100"
                        x="-5"
                        y="0"
                        textAnchor="middle"
                    >
                        {value}
                    </Text>
                    <Line
                        id="valueHorizontalLine"
                        x1="0"
                        y1="0"
                        x2="100"
                        y2="0"
                        stroke={GlobalColors.disabledGray}
                        strokeWidth="0.2"
                    />
                </G>
            );
        });
    }

    renderVerticalGrid() {
        return this.props.chartData.map((value, index) => {
            return (
                <Text
                    fill={GlobalColors.textBlack}
                    fontSize="3"
                    fontWeight="100"
                    x={(index * 100) / (this.props.chartData.length - 1)}
                    y="105"
                    textAnchor="middle"
                >
                    {value.x}
                </Text>
            );
        });
    }

    renderLineChart() {
        let polylineVertices = [];
        const dots = this.props.chartData.map((value, index) => {
            yPosition = 100 - (value.y * 100) / this.maxValue;
            xPosition = (index * 100) / (this.props.chartData.length - 1);
            polylineVertices.push(xPosition);
            polylineVertices.push(yPosition);
            return (
                <Circle
                    cx={xPosition}
                    cy={yPosition}
                    r="1"
                    fill={GlobalColors.white}
                    strokeWidth="0.4"
                    stroke={GlobalColors.red}
                />
            );
        });
        return (
            <G>
                <Polyline
                    points={polylineVertices}
                    fill="none"
                    stroke={GlobalColors.red}
                    strokeWidth="0.5"
                />
                {dots}
            </G>
        );
    }

    renderDataLabels() {
        return (
            <View style={styles.keyContainer}>
                {Icons.lineChart()}
                <ReactText style={[styles.description, { marginLeft: 5 }]}>
                    {this.props.chartOptions.yLabel}
                </ReactText>
            </View>
        );
    }

    render() {
        return (
            <View style={styles.container}>
                <View style={styles.topBarContainer}>
                    <View style={styles.topBarTextContainer}>
                        <ReactText style={styles.title}>
                            {this.props.chartOptions.title}
                        </ReactText>
                        <ReactText style={styles.description}>
                            {this.props.chartOptions.description}
                        </ReactText>
                    </View>
                    <Image />
                </View>
                <View style={styles.chartContainer}>
                    <Svg height="100%" width="100%" viewBox="0 0 100 100">
                        <G scale="0.88" x="8" y="3">
                            {this.renderHorizontalGrid()}
                            {this.renderVerticalGrid()}
                            {this.renderLineChart()}
                        </G>
                    </Svg>
                </View>
                <View style={styles.bottomBarContiner}>
                    {this.renderDataLabels()}
                </View>
            </View>
        );
    }
}
