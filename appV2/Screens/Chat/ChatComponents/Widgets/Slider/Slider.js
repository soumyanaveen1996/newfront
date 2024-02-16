import React from 'react';
import {
    Text,
    View,
    PanResponder,
    Animated,
    ScrollView,
    TouchableOpacity
} from 'react-native';
import { CheckBox } from '@rneui/themed';
import styles, { HEADER_HEIGHT } from './styles';
import {
    SCREEN_HEIGHT,
    sliderAnimationConfig,
    gestureStateConfig,
    INFOPOPUP_HEIGHT
} from './config';
import I18n from '../../../../../config/i18n/i18n';
import { Icons } from '../../../../../config/icons';
import GlobalColors from '../../../../../config/styles';
import NavigationAction from '../../../../../navigation/NavigationAction';

export const SLIDER_DEFAULT_HEIGHT = SCREEN_HEIGHT / 2.4;

const SliderStates = {
    INITIAL: 'intial',
    LOADING: 'loading',
    LOADED: 'loaded',
    CLOSING: 'closing'
};

export default class Slider extends React.Component {
    constructor(props) {
        super(props);
        this.maxHeight = this.maxSliderHeight();
        this.itemHeights = {};
        this.totalItemHeight = 0;
        this.layoutCalculatedItemsCount = 0;

        this.state = {
            topPosition: new Animated.Value(SCREEN_HEIGHT - this.maxHeight),
            animatedInitialHeight: new Animated.Value(0),
            sliderState: SliderStates.INITIAL,
            selectedRows: [],
            messageArray: this.props.message
        };
    }

    maxSliderHeight = () => this.props.maxHeight || SLIDER_DEFAULT_HEIGHT;

    UNSAFE_componentWillMount() {
        this._panResponder = PanResponder.create({
            onStartShouldSetPanResponder: (evt, gestureState) => true,
            onStartShouldSetPanResponderCapture: (evt, gestureState) => true,
            onMoveShouldSetPanResponder: (evt, gestureState) => true,
            onMoveShouldSetPanResponderCapture: (evt, gestureState) => true,

            onPanResponderGrant: (evt, gestureState) => {},

            onPanResponderRelease: (evt, gestureState) => {
                if (
                    gestureState.moveY >
                        SCREEN_HEIGHT - gestureStateConfig.minimizedHeight ||
                    gestureState.vy >
                        gestureStateConfig.velocityYForSliderAnimation
                ) {
                    this.semiCloseSlider();
                }
                if (
                    gestureState.dy < 0 &&
                    gestureState.vy <
                        -1.0 * gestureStateConfig.velocityYForSliderAnimation
                ) {
                    Animated.timing(this.state.topPosition, {
                        toValue: 0,
                        duration: sliderAnimationConfig.duration
                    }).start();
                }
                this.state.topPosition.flattenOffset();
                if (this.props.onResize) {
                    this.props.onResize();
                }
            },

            onPanResponderMove: Animated.event([
                null,
                {
                    moveY: this.state.topPosition
                }
            ])
        });
    }

    close = (doneCallback, scroll = false) => {
        this.animateClose(() => {
            this.setState({ selectedRows: [] });
            this.props.onClose(undefined, false);
            if (doneCallback) {
                doneCallback();
            }
        });
    };

    animateClose = (callback) => {
        this.setState({ sliderState: SliderStates.CLOSING });
        Animated.timing(this.state.topPosition, {
            toValue: SCREEN_HEIGHT,
            duration: sliderAnimationConfig.duration
        }).start(() => {
            callback();
        });
    };

    closeSlider = (optionalCb) => {
        this.animateClose(() => {
            this.setState({ selectedRows: [] });
            this.props.onClose(optionalCb);
        });
    };

    semiCloseSlider = () => {
        Animated.timing(this.state.topPosition, {
            toValue: SCREEN_HEIGHT,
            duration: sliderAnimationConfig.duration
        }).start();
    };

    headerRightButton = () => {
        const { options } = this.props;
        if (
            options != null &&
            options.select === true &&
            options.smartReply !== true
        ) {
            return (
                <Text
                    onPress={this.onDonePress.bind(this)}
                    style={styles.closeText}
                >
                    {I18n.t('Done')}
                </Text>
            );
        }
        return (
            <View
                {...this._panResponder.panHandlers}
                style={styles.rightButton}
            >
                <Text />
            </View>
        );
    };

    onDonePress = () => {
        const { options } = this.props;
        const messageToSend = [];

        this.state.selectedRows.forEach((row) => {
            if (row.isSelected === true) {
                messageToSend.push(this.state.messageArray[row.id[0]]);
            }
        });
        const { doneFunction } = options;
        if (doneFunction != null) {
            doneFunction(messageToSend);
        }

        this.closeSlider();
    };

    onRowsSelect(index, i) {
        const rowID = {
            id: [index, i]
        };
        const { options } = this.props;

        if (options && options.smartReply === true && options.tapFunction) {
            const messageSelected = this.state.messageArray[index];
            this.closeSlider(() => {
                options.tapFunction(messageSelected);
            });
            return;
        }

        const tempSelectedArray = [...this.state.selectedRows];
        if (
            options &&
            options.select === true &&
            options.multiSelect === true
        ) {
            for (let idx = 0; idx < this.state.selectedRows.length; idx++) {
                if (
                    this.state.selectedRows[idx].id[0] === index &&
                    this.state.selectedRows[idx].id[1] === i
                ) {
                    tempSelectedArray[idx].isSelected =
                        !tempSelectedArray[idx].isSelected;
                    this.setState({ selectedRows: [...tempSelectedArray] });
                    return;
                }
            }
        } else if (
            options &&
            options.select === true &&
            options.multiSelect === false
        ) {
            this.state.selectedRows.map((row, idx) => {
                if (row.id[0] !== index && row.id[1] !== i) {
                    tempSelectedArray[idx].isSelected = false;
                }
            });

            for (let idx = 0; idx < this.state.selectedRows.length; idx++) {
                if (
                    this.state.selectedRows[idx].id[0] === index &&
                    this.state.selectedRows[idx].id[1] === i
                ) {
                    tempSelectedArray[idx].isSelected =
                        !tempSelectedArray[idx].isSelected;
                    this.setState({ selectedRows: [...tempSelectedArray] });
                    return;
                }
            }
        }
        if (options && options.select === true) {
            this.setState({
                selectedRows: [
                    ...this.state.selectedRows,
                    { ...rowID, isSelected: true }
                ]
            });
        }
    }

    renderCheckbox = (index, i) => {
        const { options } = this.props;
        let selected = false;
        this.state.selectedRows.map((row, idx) => {
            if (row.id[0] === index) {
                selected = row.isSelected;
            }
        });

        if (options && options.select === true && options.smartReply !== true) {
            return (
                <CheckBox
                    containerStyle={styles.checkboxContainer}
                    style={styles.checkboxIconStyle}
                    textStyle={{ padding: 0, mergin: 0 }}
                    size={24}
                    iconType="ionicon"
                    checkedIcon="ios-checkbox-outline"
                    uncheckedIcon="ios-square-outline"
                    checkedColor={GlobalColors.primaryButtonColor}
                    checked={selected}
                    onPress={() => this.onRowsSelect(index, i)}
                />
            );
        }
    };

    renderInfoButton = (index) => {
        if (
            this.state.messageArray[index].data ||
            this.state.messageArray[index].url
        ) {
            return (
                <TouchableOpacity
                    onPress={() => {
                        if (this.state.messageArray[index].data != null) {
                            this.fireInfoPopUp(this.state.messageArray[index]);
                        } else {
                            this.fireWebView(this.state.messageArray[index]);
                        }
                    }}
                    style={styles.infoImageContainer}
                >
                    {Icons.info()}
                </TouchableOpacity>
            );
        }
    };

    renderMessage = (message, index) => (
        <TouchableOpacity
            style={styles.textContainer}
            onPress={() => this.onRowsSelect(index, index)}
        >
            <View style={styles.textContainer}>
                <Text style={styles.textStyle} ellipsizeMode="tail">
                    {message.title}
                </Text>
            </View>
        </TouchableOpacity>
    );

    fireInfoPopUp(dataObject) {
        NavigationAction.push(NavigationAction.SCREENS.info, {
            data: dataObject,
            height: INFOPOPUP_HEIGHT
        });
    }

    fireWebView(dataObject) {
        NavigationAction.push(NavigationAction.SCREENS.webview, {
            url: dataObject.url
        });
    }

    heightStyle() {
        if (this.state.sliderState === SliderStates.INITIAL) {
            return { height: 0 };
        }
        if (this.state.sliderState === SliderStates.LOADING) {
            return { height: this.state.animatedInitialHeight };
        }
        if (this.state.sliderState === SliderStates.LOADED) {
            const height = this.state.topPosition.interpolate({
                inputRange: [
                    SCREEN_HEIGHT - this.maxHeight,
                    SCREEN_HEIGHT - sliderAnimationConfig.minimizedHeight
                ],
                outputRange: [
                    this.maxHeight,
                    0 + sliderAnimationConfig.minimizedHeight
                ],
                extrapolate: 'clamp'
            });
            return { height };
        }
        const height = this.state.topPosition.interpolate({
            inputRange: [
                SCREEN_HEIGHT - this.maxHeight,
                SCREEN_HEIGHT - sliderAnimationConfig.minimizedHeight
            ],
            outputRange: [this.maxHeight, 0],
            extrapolate: 'clamp'
        });
        return { height };
    }

    animateSlider = () => {
        this.setState({
            sliderState: SliderStates.LOADING
        });
        this.state.animatedInitialHeight.setValue(0);
        Animated.timing(this.state.animatedInitialHeight, {
            toValue: this.maxHeight,
            duration: sliderAnimationConfig.duration
        }).start(() => {
            this.setState({ sliderState: SliderStates.LOADED });
            if (this.props.onSliderOpen) {
                this.props.onSliderOpen();
            }
        });
    };

    onItemLayout = (event, index) => {
        if (this.itemHeights[index] === undefined) {
            const { height } = event.nativeEvent.layout;
            this.totalItemHeight += height;
            this.itemHeights[index] = height;
            this.layoutCalculatedItemsCount += 1;
        }

        if (
            this.state.messageArray.length === this.layoutCalculatedItemsCount
        ) {
            const maxHeight = this.maxSliderHeight();
            this.maxHeight =
                this.totalItemHeight + HEADER_HEIGHT > maxHeight
                    ? maxHeight
                    : this.totalItemHeight + HEADER_HEIGHT;
            this.setState({ sliderState: SliderStates.LOADING }, () => {
                this.animateSlider();
            });
        }
    };

    cancelSlider() {
        const { options } = this.props;
        if (options && options.cancelFunction) {
            options.cancelFunction();
        }
        this.closeSlider();
    }

    render() {
        return (
            <Animated.View style={this.heightStyle()}>
                <View style={styles.headerView}>
                    <Text
                        accessibilityLabel="Slider Close Button"
                        testID="slider-close-button"
                        onPress={this.cancelSlider.bind(this)}
                        style={styles.closeText}
                    >
                        Close
                    </Text>
                    <View
                        style={styles.topBarLine}
                        {...this._panResponder.panHandlers}
                    />
                    {this.headerRightButton()}
                </View>
                <ScrollView
                    keyboardShouldPersistTaps="handled"
                    style={styles.scrollView}
                >
                    {this.state.messageArray.map((message, index) => (
                        <View
                            style={styles.listContainer1}
                            key={index}
                            onLayout={(event) => {
                                this.onItemLayout(event, index);
                            }}
                        >
                            <View style={styles.listcontainer2}>
                                {this.renderCheckbox(index, index)}
                                {this.renderMessage(message, index)}
                                {this.renderInfoButton(index)}
                            </View>
                        </View>
                    ))}
                </ScrollView>
            </Animated.View>
        );
    }
}
