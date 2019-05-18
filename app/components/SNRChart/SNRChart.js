import React, { Component } from 'react';
import { ScrollView, Text } from 'react-native';
import { VictoryChart, VictoryLine, VictoryAxis } from 'victory-native';
import { HeaderBack } from '../Header';
import { Actions } from 'react-native-router-flux';
import { styles, chartStyles } from './styles';
import _ from 'lodash';
import moment from 'moment';

export default class SNRChart extends Component {
    static navigationOptions({ navigation, screenProps }) {
        return {
            headerLeft: <HeaderBack onPress={Actions.pop} />
        };
    }

    constructor(props) {
        super(props);
        if (this.props.chartData.data instanceof Array) {
            this.data = [...this.props.chartData.data];
            if (this.data.length === 1) {
                this.data.push(this.props.chartData.data[0]);
            }
        }
    }

    getYDomain() {
        const snrData = this.data;
        const maxVal = _.maxBy(snrData, d => d.SNR);
        return [0, maxVal.SNR > 2 ? maxVal.SNR : 2];
    }

    getXDomain() {
        const snrData = this.data;
        const minVal = _.minBy(snrData, d => d.Timestamp);
        const maxVal = _.maxBy(snrData, d => d.Timestamp);
        return [minVal.Timestamp, maxVal.Timestamp];
    }

    getTickValues() {
        const snrData = this.data;
        const minVal = _.minBy(snrData, d => d.Timestamp);
        const maxVal = _.maxBy(snrData, d => d.Timestamp);
        const midVal = Math.floor((minVal.Timestamp + maxVal.Timestamp) / 2);
        return [minVal.Timestamp, midVal, maxVal.Timestamp];
    }

    render() {
        return (
            <ScrollView
                contentContainerStyle={styles.container}
                scrollEnabled={true}
            >
                <Text style={styles.text}>{this.props.chartTitle}</Text>
                <VictoryChart>
                    <VictoryAxis
                        style={chartStyles.axis}
                        dependentAxis
                        domain={[0, 2]}
                        standalone={false}
                    />
                    <VictoryAxis
                        style={chartStyles.axis}
                        scale="time"
                        domain={[0, 2]}
                        standalone={false}
                        domain={this.getXDomain()}
                        tickValues={this.getTickValues()}
                        label="Time"
                        tickFormat={x => moment(x).format('H:mm:ss')}
                    />
                    <VictoryLine
                        style={chartStyles.line}
                        data={this.data}
                        x="Timestamp"
                        y="SNR"
                    />
                </VictoryChart>
            </ScrollView>
        );
    }
}
