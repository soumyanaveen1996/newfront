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
import { StackedBarChart } from 'react-native-svg-charts';
import styles from './styles';
import GlobalColors from '../../config/styles';
import _ from 'lodash';
import Icons from '../../config/icons';
import { chartTypes } from './config';
import ColorPalette from 'nice-color-palettes';

export default class ChartMessage extends React.Component {
    constructor(props) {
        super(props);
        this.colorPalette = [].concat.apply([], ColorPalette);
        this.state = {
            minYValue: 0,
            maxYValue: 0,
            yDelta: 0,
            xLabels: [],
            loading: true
        };
    }

    componentDidMount() {
        let minYValue;
        let maxYValue;
        let minXValue;
        let maxXValue;
        let yDelta;
        let xDelta;
        let xLabels;
        let yLabels;
        let barLabels;
        if (this.props.chartOptions.chartType === chartTypes.STACK_BAR) {
            minYValue = this.props.chartOptions.minYValue || 0;
            maxYValue =
                this.props.chartOptions.maxYValue ||
                Math.max(
                    ...this.props.chartData.map(stack => {
                        return _.sumBy(stack, 'y');
                    })
                );
            yDelta =
                this.props.chartOptions.yDelta ||
                Math.round((maxYValue - minYValue) / 8);
            maxYValue += yDelta;
            barLabels = _.union(
                ...this.props.chartData.map(stack => {
                    return stack.map(bar => {
                        return bar.x;
                    });
                })
            );
            barLabels = barLabels.map((label, index) => {
                return {
                    label: label,
                    color: this.colorPalette[index]
                };
            });
            xLabels = this.props.chartOptions.xLabels.slice(
                0,
                this.props.chartData.length
            );
            yLabels = [];
            for (let key = minYValue; key < maxYValue; key += yDelta) {
                yLabels.push(key);
            }
            yLabels.reverse();
        } else if (this.props.chartOptions.chartType === chartTypes.LINE) {
            minYValue =
                this.props.chartOptions.minYValue ||
                _.minBy(this.props.chartData, 'y').y;
            maxYValue =
                this.props.chartOptions.maxYValue ||
                _.maxBy(this.props.chartData, 'y').y;
            yDelta =
                this.props.chartOptions.yDelta ||
                Math.round((maxYValue - minYValue) / 8);
            minYValue = minYValue - yDelta;
            maxYValue = maxYValue + yDelta;
            yLabels = [];
            for (let key = minYValue; key < maxYValue; key += yDelta) {
                yLabels.push(key);
            }
            yLabels.reverse();
        } else if (this.props.chartOptions.chartType === chartTypes.BUBBLE) {
            minYValue =
                this.props.chartOptions.minYValue ||
                _.minBy(this.props.chartData, 'y').y;
            maxYValue =
                this.props.chartOptions.maxYValue ||
                _.maxBy(this.props.chartData, 'y').y;
            yDelta =
                this.props.chartOptions.yDelta ||
                Math.round(((maxYValue - minYValue) / 8) * 100) / 100;
            minYValue -= yDelta;
            maxYValue += yDelta;
            yLabels = [];
            for (let key = minYValue; key < maxYValue; key += yDelta) {
                yLabels.push(key);
            }
            yLabels.reverse();

            minXValue = _.minBy(this.props.chartData, 'x').x;
            maxXValue = _.maxBy(this.props.chartData, 'x').x;
            console.log('>>>>>>>max', maxXValue);
            console.log('>>>>>>>min', minXValue);
            xDelta = Math.round(((maxXValue - minXValue) / 8) * 100) / 100;
            minXValue -= xDelta;
            maxXValue += xDelta;
            console.log('>>>>>>>maxnew', maxXValue);
            console.log('>>>>>>>minnew', minXValue);
            xLabels = [];
            for (let key = minXValue; key < maxXValue; key += xDelta) {
                xLabels.push(key);
            }
        }

        this.setState({
            minYValue,
            maxYValue,
            minXValue,
            maxXValue,
            yDelta,
            xDelta,
            xLabels,
            yLabels,
            barLabels,
            loading: false
        });
    }

    renderHorizontalGrid() {
        return this.state.yLabels.map(value => {
            return (
                <G y={100 - (value * 100) / this.state.maxYValue}>
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
        if (
            this.props.chartOptions.chartType === chartTypes.STACK_BAR ||
            this.props.chartOptions.chartType === chartTypes.BUBBLE
        ) {
            console.log('>>>>>>>>assa', this.state.xLabels);
            return this.state.xLabels.map((label, index) => {
                return (
                    <G x={(100 / this.state.xLabels.length) * index}>
                        <Text
                            fill={GlobalColors.textBlack}
                            fontSize="3"
                            fontWeight="100"
                            x="0"
                            y="105"
                            textAnchor="start"
                        >
                            {label}
                        </Text>
                        {this.props.chartOptions.chartType ===
                        chartTypes.STACK_BAR ? null : (
                                <Line
                                    id="valueHorizontalLine"
                                    x1="0"
                                    y1="0"
                                    x2="0"
                                    y2="100"
                                    stroke={GlobalColors.disabledGray}
                                    strokeWidth="0.2"
                                />
                            )}
                    </G>
                );
            });
        } else {
            return this.props.chartData.map((value, index) => {
                return (
                    <G x={(index * 100) / (this.props.chartData.length - 1)}>
                        <Text
                            fill={GlobalColors.textBlack}
                            fontSize="3"
                            fontWeight="100"
                            x="0"
                            y="105"
                            textAnchor="middle"
                        >
                            {value.x}
                        </Text>
                        <Line
                            id="valueHorizontalLine"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="100"
                            stroke={GlobalColors.disabledGray}
                            strokeWidth="0.2"
                        />
                    </G>
                );
            });
        }
    }

    renderLineChart() {
        let polylineVertices = [];
        const dots = this.props.chartData.map((value, index) => {
            yPosition = 100 - (value.y * 100) / this.state.maxYValue;
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

    renderStackedBarChart() {
        return _.flatten(
            this.props.chartData.map((stack, xValue) => {
                let yPosition = 100;
                return stack.map(bar => {
                    const width = 80 / this.props.chartData.length;
                    const height = (bar.y * 100) / this.state.maxYValue;
                    const color = this.state.barLabels.find(label => {
                        return label.label === bar.x;
                    }).color;
                    yPosition -= height;
                    return (
                        <Rect
                            x={(xValue * 100) / this.props.chartData.length}
                            y={yPosition}
                            width={width}
                            height={height}
                            fill={color}
                            strokeWidth="0"
                        />
                    );
                });
            })
        );
    }

    renderBubbleChart() {
        let maxSize = _.maxBy(this.props.chartData, 'value').value;
        return this.props.chartData.map((bubble, index) => {
            let yPosition = 100 - (bubble.y * 100) / this.state.maxYValue;
            let xPosition =
                (bubble.x * 100) /
                (this.state.maxXValue - this.state.minXValue);
            return (
                <Circle
                    cx={xPosition}
                    cy={yPosition}
                    r={(bubble.value * 17) / maxSize}
                    fill={this.colorPalette[index]}
                    opacity={0.7}
                />
            );
        });
    }

    renderDataLabels() {
        if (this.props.chartOptions.chartType === chartTypes.STACK_BAR) {
            return this.state.barLabels.map(label => {
                return (
                    <View style={styles.keyContainer}>
                        {Icons.square({ color: label.color })}
                        <ReactText
                            style={[styles.description, { marginLeft: 5 }]}
                        >
                            {label.label}
                        </ReactText>
                    </View>
                );
            });
        } else {
            return (
                <View style={styles.keyContainer}>
                    {Icons.lineChart()}
                    <ReactText style={[styles.description, { marginLeft: 5 }]}>
                        {this.props.chartOptions.yLabel}
                    </ReactText>
                </View>
            );
        }
    }

    render() {
        return (
            <View style={styles.container}>
                <View style={styles.topBarContainer}>
                    <View style={styles.topBarTextContainer}>
                        <ReactText
                            style={styles.title}
                            numberOfLines={1}
                            lineBreakMode="tail"
                        >
                            {this.props.chartOptions.title}
                        </ReactText>
                        <ReactText
                            style={styles.description}
                            numberOfLines={1}
                            lineBreakMode="tail"
                        >
                            {this.props.chartOptions.description}
                        </ReactText>
                    </View>
                    <Image />
                </View>
                <View style={styles.chartContainer}>
                    <Svg height="100%" width="100%" viewBox="0 0 100 100">
                        {this.state.loading ? null : (
                            <G scale="0.88" x="8" y="3">
                                {this.renderHorizontalGrid()}
                                {this.renderVerticalGrid()}
                                {this.props.chartOptions.chartType ===
                                chartTypes.LINE
                                    ? this.renderLineChart()
                                    : null}
                                {this.props.chartOptions.chartType ===
                                chartTypes.STACK_BAR
                                    ? this.renderStackedBarChart()
                                    : null}
                                {this.props.chartOptions.chartType ===
                                chartTypes.BUBBLE
                                    ? this.renderBubbleChart()
                                    : null}
                            </G>
                        )}
                    </Svg>
                </View>
                <View style={styles.bottomBarContiner}>
                    {this.state.loading ? null : this.renderDataLabels()}
                </View>
            </View>
        );
    }
}
