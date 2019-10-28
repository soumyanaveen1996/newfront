import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Image,
    ScrollView,
    Platform,
    PermissionsAndroid
} from 'react-native';
import styles from './styles';
import Contacts from 'react-native-contacts';
import { Icons } from '../../config/icons';
import Modal from 'react-native-modal';
import { Actions, ActionConst } from 'react-native-router-flux';
import images from '../../images';
import {
    SECTION_HEADER_HEIGHT,
    SCREEN_WIDTH,
    scrollViewConfig
} from './config';
import moment from 'moment-timezone';
export default class TimeZonePickerModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            timezoneList: [],
            searchContact: [],
            selectedTimezone: {}
        };
    }

    componentDidMount() {
        this.fetchTimeZone();
    }

    fetchTimeZone = () => {
        let timeZones = moment.tz.names();
        let offsetTmz = [];
        for (let i in timeZones) {
            let obj = {
                value: timeZones[i],
                placeholder:
                    ' (GMT' +
                    moment.tz(timeZones[i]).format('Z') +
                    ')' +
                    timeZones[i]
            };
            offsetTmz.push(obj);
        }

        this.setState({ timezoneList: offsetTmz }, () => {
            this.state.timezoneList.forEach((elem, index) => {
                if (this.props.selectedTimezone === elem.value) {
                    this.toggleSelectTimezone(elem, index);
                }
            });
        });
    };

    toggleSelectTimezone = (data, index) => {
        let array = [...this.state.timezoneList];
        array[index].selected = !array[index].selected;
        array.map((elem, elemIndex) => {
            if (index !== elemIndex) {
                elem.selected = false;
            }
        });

        this.setState({
            timezoneList: [...array],
            selectedTimezone: { ...array[index] }
        });
    };

    renderTimeZone = () => {
        if (this.state.timezoneList && this.state.timezoneList.length > 0) {
            return this.state.timezoneList.map((elem, index) => {
                return (
                    <View
                        key={index}
                        style={{
                            flex: 1,
                            backgroundColor: '#fff',
                            padding: 5,
                            margin: 5
                        }}
                    >
                        <TouchableOpacity
                            onPress={() =>
                                this.toggleSelectTimezone(elem, index)
                            }
                            style={{
                                flexDirection: 'row',
                                height: 30,
                                alignItems: 'center'
                            }}
                            key={index}
                        >
                            <Image
                                style={{ marginRight: 5 }}
                                source={
                                    !elem.selected
                                        ? images.checkmark_normal
                                        : images.checkmark_selected
                                }
                            />
                            <View
                                style={{
                                    textAlign: 'center'
                                }}
                            >
                                <Text
                                    style={{
                                        fontSize: 14,
                                        color: 'rgba(0,0,0,0.6)'
                                    }}
                                >
                                    {elem.placeholder}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                );
            });
        } else {
            return (
                <View>
                    <Text>There are no timzone</Text>
                </View>
            );
        }
    };

    importSelectedTimezone = () => {
        console.log('mapping timeZone labels ', this.state.selectedTimezone);
        this.props.selectingTimeZone(this.state.selectedTimezone);
        this.props.setVisible(false);
    };

    render() {
        return (
            <Modal
                isVisible={this.props.isVisible}
                swipeArea={50}
                onBackdropPress={() => {
                    this.props.setVisible(false);
                }}
                onBackButtonPress={() => {
                    this.props.setVisible(false);
                }}
                // onSwipe={() => this.props.setVisible(false)}
                // swipeDirection="right"
                swipeToClose={false}
            >
                <View style={styles.localContactModal}>
                    <View style={{ position: 'absolute', right: 10, top: 10 }}>
                        <TouchableOpacity
                            onPress={() => {
                                this.props.setVisible(false);
                            }}
                        >
                            <Image
                                style={{
                                    width: 15,
                                    height: 15,
                                    resizeMode: 'center',
                                    padding: 5
                                }}
                                source={require('../../images/remove-icon/popup-close.png')}
                            />
                        </TouchableOpacity>
                    </View>
                    <Text
                        style={{
                            marginBottom: 10,
                            fontSize: 18,
                            height: 45
                        }}
                    >
                        All Timezones
                    </Text>

                    <ScrollView
                        style={{
                            width: '100%',
                            height: 200,
                            backgroundColor: '#fff',
                            marginBottom: 10,
                            paddingHorizontal: 45
                        }}
                    >
                        {this.renderTimeZone()}
                    </ScrollView>

                    <View
                        style={{
                            justifyContent: 'flex-end',
                            height: 45
                        }}
                    >
                        <TouchableOpacity
                            onPress={() => {
                                this.importSelectedTimezone();
                            }}
                            style={{
                                width: 200,
                                height: 40,
                                backgroundColor: 'rgba(0,189,242,1)',
                                justifyContent: 'center',
                                alignItems: 'center',
                                borderRadius: 6
                            }}
                        >
                            <Text
                                style={{
                                    fontSize: 16,
                                    color: 'rgba(255,255,255,1)'
                                }}
                            >
                                Done
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        );
    }
}
