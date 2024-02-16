import React from 'react';
import {
    Text,
    View,
    Image,
    ActivityIndicator,
    TouchableOpacity
} from 'react-native';
import styles from './styles';
import images from '../../../../config/images';
import { ControlDAO } from '../../../../lib/persistence';
import EventEmitter, { TrackerEvents } from '../../../../lib/events';
import { Message } from '../../../../lib/capability';
import Icons from '../../../../config/icons';
import GlobalColors from '../../../../config/styles';

export const TrackingViewActions = {
    REFRESH: 'refresh',
    CLOSE: 'close'
};

export class TrackingViewMessage extends React.Component {
    constructor(props) {
        super(props);
        this.dayNames = [
            'Monday',
            'Tuesday',
            'Wednesday',
            'Thursday',
            'Friday',
            'Saturday',
            'Sunday'
        ];
        this.monthNames = [
            'January',
            'February',
            'March',
            'April',
            'May',
            'June',
            'July',
            'August',
            'September',
            'October',
            'November',
            'December'
        ];
        this.state = {
            data: {},
            options: {}
        };
    }

    async componentDidMount() {
        const data = await ControlDAO.getContentById(this.props.localControlId);
        const options = await ControlDAO.getOptionsById(
            this.props.localControlId
        );
        this.setState({ data: data, options: options });
        this.updateSubscriber = EventEmitter.addListener(
            TrackerEvents.updateTracker,
            this.updateTracker.bind(this)
        );
        this.onCloseControl = this.closeTrackingView;
    }

    componentWillUnmount() {
        this.updateSubscriber?.remove();
    }

    updateTracker(message) {
        if (
            message.getMessageOptions().controlId ===
            this.state.options.controlId
        ) {
            this.setState({
                data: message.getMessage(),
                options: message.getMessageOptions()
            });
        }
    }

    closeTrackingView = () => {
        const msg = {
            controlId: this.state.options.controlId,
            action: TrackingViewActions.CLOSE
        };
        this.sendMessage(msg);
    };

    refreshTrackingView = () => {
        const msg = {
            controlId: this.state.options.controlId,
            action: TrackingViewActions.REFRESH
        };
        this.sendMessage(msg);
    };

    sendMessage(msg) {
        let message = new Message();
        message.trackingViewResponse(msg);
        message.setCreatedBy(this.props.userId);
        this.props.sendMessage(message);
    }

    getHoursAndMinutes(seconds) {
        let minutes = seconds / 60;
        const hours = Math.floor(minutes / 60);
        minutes = minutes % 60;
        return hours + 'h ' + Math.floor(minutes) + 'm';
    }

    renderInfo(data, textAlign) {
        let splitIndex = data.place.indexOf(',') + 1;
        if (splitIndex < 1) {
            splitIndex = data.place.length;
        }
        const line1Place = data.place.slice(0, splitIndex);
        const line2Place = data.place.slice(splitIndex);
        const date = data.timeStamp;
        let infoFields = [];
        infoFields.push(
            <Text style={[styles.titleText, textAlign]}>{data.title}</Text>
        );
        infoFields.push(
            <Text style={[styles.codeText, textAlign]}>{data.code}</Text>
        );
        infoFields.push(
            <Text style={[styles.placeText, textAlign]}>{line1Place}</Text>
        );
        infoFields.push(
            <Text style={[styles.boldText, textAlign]}>{line2Place}</Text>
        );
        infoFields.push(<View style={styles.separator} />);
        infoFields.push(
            <Text style={[styles.lightText, textAlign]}>{date}</Text>
        );
        // infoFields.push(<Text style={[styles.boldText, textAlign]}>{time}</Text>);
        return infoFields;
    }

    renderTracker() {
        const trackerValue =
            JSON.stringify(
                (this.state.data.tracking.currentPosition.totalTimeElapsed *
                    100) /
                    this.state.data.tracking.currentPosition
                        .totalTripTimeEstimation
            ) + '%';
        const timeRemaining =
            this.state.data.tracking.currentPosition.totalTripTimeEstimation -
            this.state.data.tracking.currentPosition.totalTimeElapsed;
        return (
            <View style={styles.trackerContainer}>
                <View style={styles.sliderTrack}>
                    <View style={[styles.leftTrack, { width: trackerValue }]} />
                    <Image
                        source={images.moving_maps_plane_blue_icon}
                        style={styles.trackIcon}
                        resizeMode="contain"
                    />
                </View>
                <View
                    style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between'
                    }}
                >
                    <Text style={styles.trackerText}>
                        {this.getHoursAndMinutes(
                            this.state.data.tracking.currentPosition
                                .totalTimeElapsed
                        )}{' '}
                        elapsed
                    </Text>
                    <Text style={styles.trackerText}>
                        {this.getHoursAndMinutes(timeRemaining)} remaining
                    </Text>
                </View>
            </View>
        );
    }

    refresher = () => (
        <View>
            <TouchableOpacity
                style={styles.refresherContainer}
                onPress={this.refreshTrackingView}
            >
                {Icons.refresh({ color: GlobalColors.textDarkGrey, size: 16 })}
                <Text style={styles.refreshText}>Refresh</Text>
            </TouchableOpacity>
        </View>
    );

    render() {
        const containerStyles =
            this.props.conversational === false
                ? styles.containerNonConv
                : styles.container;
        if (this.state.data.tracking) {
            return (
                <View style={containerStyles}>
                    <View style={styles.infoContainer}>
                        <View style={styles.originContainer}>
                            {this.renderInfo(this.state.data.tracking.origin, {
                                textAlign: 'left'
                            })}
                        </View>
                        <View style={styles.destinationContainer}>
                            {this.renderInfo(
                                this.state.data.tracking.destination,
                                { textAlign: 'right' }
                            )}
                        </View>
                    </View>
                    {this.renderTracker()}
                    {this.refresher()}
                </View>
            );
        }

        return (
            <View style={containerStyles}>
                <ActivityIndicator size={'large'} />
            </View>
        );
    }
}
