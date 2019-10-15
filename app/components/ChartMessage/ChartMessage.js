import React from 'react';
import { View, Image, Text as ReactText, TouchableOpacity } from 'react-native';
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
import SvgPanZoom, { SvgPanZoomElement } from 'react-native-svg-pan-zoom';
import { Actions } from 'react-native-router-flux';
import { PieChart } from 'react-native-svg-charts';
import ROUTER_SCENE_KEYS from '../../routes/RouterSceneKeyConstants';
import { ControlDAO } from '../../lib/persistence';

export default class ChartMessage extends React.Component {
    constructor(props) {
        super(props);
        this.colorPalette = [].concat.apply([], ColorPalette);
        this.state = {
            minYValue: 0,
            maxYValue: 0,
            minXValue: 0,
            maxXValue: 0,
            xDelta: 0,
            yDelta: 0,
            xLabels: [],
            yLabels: [],
            colorLabels: [],
            loading: true,
            chartData: {},
            chartOptions: {}
        };
    }

    componentDidMount() {
        let chartData;
        let chartOptions;
        ControlDAO.getContentById(this.props.chartOptions.chartId)
            .then(data => {
                chartData = data;
                return ControlDAO.getOptionsById(
                    this.props.chartOptions.chartId + this.props.conversationId
                );
            })
            .then(options => {
                chartOptions = options;
                this.plotChart(chartData, chartOptions);
            });
    }

    componentDidUpdate(prevProps) {
        if (
            this.props.chartOptions.update &&
            this.state.chartData !== this.props.chartData
        ) {
            this.plotChart(this.props.chartData, this.props.chartOptions);
            if (Actions.currentScene === ROUTER_SCENE_KEYS.chartScreen) {
                Actions.refresh({
                    chartOptions: this.props.chartOptions,
                    chartData: this.props.chartData,
                    title: this.props.chartOptions.title
                });
            }
        }
    }

    plotChart(chartData, chartOptions) {
        let minYValue;
        let maxYValue;
        let minXValue;
        let maxXValue;
        let yDelta;
        let xDelta;
        let xLabels;
        let yLabels;
        let colorLabels;

        // STACK
        if (chartOptions.chartType === chartTypes.STACK_BAR) {
            minYValue = 0;
            maxYValue = Math.max(
                ...chartData.map(stack => {
                    return _.sumBy(stack, 'y');
                })
            );
            yDelta = (maxYValue - minYValue) / 8;
            maxYValue += yDelta;
            yLabels = [];
            for (let key = 0; key <= 10; key++) {
                yLabels.push(
                    Math.round((minYValue + key * yDelta) * 100) / 100
                );
            }

            xLabels = chartOptions.stackLabels.slice(0, chartData.length);

            colorLabels = _.union(
                ...chartData.map(stack => {
                    return stack.map(bar => {
                        return bar.x;
                    });
                })
            );
            colorLabels = colorLabels.map((label, index) => {
                return {
                    label: label,
                    color: this.colorPalette[index]
                };
            });

            //LINE
        } else if (chartOptions.chartType === chartTypes.LINE) {
            minYValue = _.minBy(chartData, 'y').y;
            maxYValue = _.maxBy(chartData, 'y').y;
            yDelta = (maxYValue - minYValue) / 8;
            minYValue -= yDelta;
            maxYValue += yDelta;
            yLabels = [];
            for (let key = 0; key <= 10; key++) {
                yLabels.push(
                    Math.round((minYValue + key * yDelta) * 100) / 100
                );
            }

            xLabels = chartData.map(dot => {
                return dot.x;
            });

            //BUBBLE
        } else if (chartOptions.chartType === chartTypes.BUBBLE) {
            minYValue = _.minBy(chartData, 'y').y;
            maxYValue = _.maxBy(chartData, 'y').y;
            yDelta = (maxYValue - minYValue) / 8;
            minYValue -= yDelta;
            maxYValue += yDelta;
            yLabels = [];
            for (let key = 0; key <= 10; key++) {
                yLabels.push(
                    Math.round((minYValue + key * yDelta) * 100) / 100
                );
            }

            minXValue = _.minBy(chartData, 'x').x;
            maxXValue = _.maxBy(chartData, 'x').x;
            xDelta = (maxXValue - minXValue) / 8;
            minXValue -= xDelta;
            maxXValue += xDelta;
            xLabels = [];
            for (let key = 0; key <= 10; key++) {
                xLabels.push(
                    Math.round((minXValue + key * xDelta) * 100) / 100
                );
            }

            colorLabels = chartOptions.bubbleLabels.slice(0, chartData.length);
            colorLabels = colorLabels.map((label, index) => {
                return {
                    label: label,
                    color: this.colorPalette[index]
                };
            });

            //PIE CHART
        } else if (chartOptions.chartType === chartTypes.PIE) {
            colorLabels = chartData.map(slice => {
                return slice.label;
            });
            colorLabels = colorLabels.map((label, index) => {
                return {
                    label: label,
                    color: this.colorPalette[index]
                };
            });
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
            colorLabels,
            loading: false,
            chartOptions: chartOptions,
            chartData: chartData
        });
    }

    renderHorizontalGrid() {
        return this.state.yLabels.map((value, index) => {
            return (
                <G y={100 - (index * 100) / (this.state.yLabels.length - 1)}>
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
        const xLabelsLength =
            this.state.chartOptions.chartType === chartTypes.STACK_BAR
                ? this.state.xLabels.length
                : this.state.xLabels.length - 1;
        return this.state.xLabels.map((value, index) => {
            return (
                <G x={(index * 100) / xLabelsLength}>
                    <Text
                        fill={GlobalColors.textBlack}
                        fontSize="3"
                        fontWeight="100"
                        x="0"
                        y="105"
                        textAnchor="middle"
                    >
                        {value}
                    </Text>
                    {this.state.chartOptions.chartType === chartTypes.LINE ||
                    this.state.chartOptions.chartType ===
                        chartTypes.STACK_BAR ? null : (
                            <Line
                                id="valueHorizontalLine"
                                x1="0"
                                y1="0"
                                x2=""
                                y2="100"
                                stroke={GlobalColors.disabledGray}
                                strokeWidth="0.2"
                            />
                        )}
                </G>
            );
        });
    }

    renderLineChart() {
        let polylineVertices = [];
        const dots = this.state.chartData.map((dot, index) => {
            yPosition =
                100 -
                ((dot.y - this.state.minYValue) * 100) /
                    (this.state.yLabels[this.state.yLabels.length - 1] -
                        this.state.minYValue);
            xPosition = (index * 100) / (this.state.xLabels.length - 1);
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
                    opacity={0.7}
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
                    opacity={0.7}
                />
                {dots}
            </G>
        );
    }

    renderStackedBarChart() {
        return _.flatten(
            this.state.chartData.map((stack, xValue) => {
                let yPosition = 100;
                const xPosition = (xValue * 100) / this.state.chartData.length;
                let filteredStack = stack.filter(bar => {
                    return bar.y >= 0;
                });
                return filteredStack.map(bar => {
                    const width = 80 / this.state.chartData.length;
                    const height =
                        ((bar.y - this.state.minYValue) * 100) /
                        (this.state.yLabels[this.state.yLabels.length - 1] -
                            this.state.minYValue);
                    const color = this.state.colorLabels.find(label => {
                        return label.label === bar.x;
                    }).color;
                    yPosition -= height;
                    return (
                        <Rect
                            x={xPosition}
                            y={yPosition}
                            width={width}
                            height={height}
                            fill={color}
                            strokeWidth="0"
                            opacity={0.7}
                        />
                    );
                });
            })
        );
    }

    renderBubbleChart() {
        let maxBubbleSize = _.maxBy(this.state.chartData, 'value').value;
        return this.state.chartData.map((bubble, index) => {
            let yPosition =
                ((bubble.y - this.state.minYValue) * 100) /
                (this.state.yLabels[this.state.yLabels.length - 1] -
                    this.state.minYValue);
            let xPosition =
                ((bubble.x - this.state.minXValue) * 100) /
                (this.state.xLabels[this.state.xLabels.length - 1] -
                    this.state.minXValue);
            return (
                <Circle
                    cx={xPosition}
                    cy={100 - yPosition}
                    r={(bubble.value * 17) / maxBubbleSize}
                    fill={this.colorPalette[index]}
                    opacity={0.7}
                />
            );
        });
    }

    renderPieChart() {
        let filteredData = this.state.chartData
            .filter(slice => {
                return slice.value > 0;
            })
            .map((slice, index) => {
                return {
                    value: slice.value,
                    svg: {
                        fill: this.colorPalette[index]
                    }
                };
            });
        return (
            <View style={{ justifyContent: 'center', flex: 1 }}>
                <PieChart
                    style={{ height: '80%' }}
                    data={filteredData}
                    innerRadius="0%"
                    padAngle={0}
                />
            </View>
        );
    }

    renderDataLabels() {
        if (this.state.chartOptions.chartType !== chartTypes.LINE) {
            return this.state.colorLabels.map(label => {
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
                        {this.state.chartOptions.yLabel}
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
                            {this.state.chartOptions.title || 'Chart'}
                        </ReactText>
                        <ReactText
                            style={styles.description}
                            numberOfLines={1}
                            lineBreakMode="tail"
                        >
                            {this.state.chartOptions.description || ''}
                        </ReactText>
                    </View>
                    <Image />
                </View>
                <TouchableOpacity
                    disabled={this.state.loading}
                    style={styles.chartContainer}
                    onPress={() =>
                        Actions.chartScreen({
                            chartOptions: this.state.chartOptions,
                            chartData: this.state.chartData,
                            title: this.state.chartOptions.title
                        })
                    }
                >
                    {this.state.loading ? null : this.state.chartOptions
                        .chartType === chartTypes.PIE ? (
                            this.renderPieChart()
                        ) : (
                            <Svg height="100%" width="100%" viewBox="0 0 100 100">
                                <G scale="0.85" x="9.5" y="3">
                                    {this.state.chartOptions.chartType ===
                                chartTypes.PIE
                                        ? null
                                        : this.renderHorizontalGrid()}
                                    {this.state.chartOptions.chartType ===
                                chartTypes.PIE
                                        ? null
                                        : this.renderVerticalGrid()}
                                    {this.state.chartOptions.chartType ===
                                chartTypes.LINE
                                        ? this.renderLineChart()
                                        : null}
                                    {this.state.chartOptions.chartType ===
                                chartTypes.STACK_BAR
                                        ? this.renderStackedBarChart()
                                        : null}
                                    {this.state.chartOptions.chartType ===
                                chartTypes.BUBBLE
                                        ? this.renderBubbleChart()
                                        : null}
                                </G>
                            </Svg>
                        )}
                </TouchableOpacity>
                <View style={styles.bottomBarContiner}>
                    {this.state.loading ? null : this.renderDataLabels()}
                </View>
            </View>
        );
    }
}
