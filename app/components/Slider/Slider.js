import React from 'react';
import { Text, View, PanResponder, Animated, ScrollView, Image, TouchableOpacity } from 'react-native';
import { Actions } from 'react-native-router-flux';
import images from '../../config/images';
import styles, { HEADER_HEIGHT } from './styles';
import { CheckBox } from 'react-native-elements';
import { SCREEN_HEIGHT, sliderAnimationConfig, checkBoxConfig, gestureStateConfig, INFOPOPUP_HEIGHT } from './config';
import I18n from '../../config/i18n/i18n';
import { Icons } from '../../config/icons';

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

    maxSliderHeight = () => {
        return this.props.maxHeight || SLIDER_DEFAULT_HEIGHT
    }

    componentWillMount() {
        this._panResponder = PanResponder.create({

            onStartShouldSetPanResponder: (evt, gestureState) => true,
            onStartShouldSetPanResponderCapture: (evt, gestureState) => true,
            onMoveShouldSetPanResponder: (evt, gestureState) => true,
            onMoveShouldSetPanResponderCapture: (evt, gestureState) => true,

            onPanResponderGrant: (evt, gestureState) => {
            },

            onPanResponderRelease: (evt, gestureState) => {
                if (gestureState.moveY > SCREEN_HEIGHT - gestureStateConfig.minimizedHeight || gestureState.vy > gestureStateConfig.velocityYForSliderAnimation) {
                    this.semiCloseSlider()
                }
                if (gestureState.dy < 0 && gestureState.vy < -1.0 * gestureStateConfig.velocityYForSliderAnimation) {

                    Animated.timing(
                        this.state.topPosition,
                        {
                            toValue: 0,
                            duration: sliderAnimationConfig.duration,
                        }
                    ).start()
                }
                this.state.topPosition.flattenOffset();
                if (this.props.onResize) {
                    this.props.onResize();
                }
            },

            onPanResponderMove: Animated.event([null, {
                moveY: this.state.topPosition
            }])
        })
    }

    close = (doneCallback, scroll = false) => {
        this.animateClose(() => {
            this.setState({ selectedRows: [] })
            this.props.onClose(undefined, false);
            if (doneCallback) {
                doneCallback();
            }
        });
    }

    animateClose = (callback) => {
        this.setState({ sliderState: SliderStates.CLOSING });
        Animated.timing(
            this.state.topPosition,
            {
                toValue: SCREEN_HEIGHT,
                duration: sliderAnimationConfig.duration
            }
        ).start(() => {
            callback();
        });
    }

    closeSlider = (optionalCb) => {
        this.animateClose(() => {
            this.setState({ selectedRows: [] })
            this.props.onClose(optionalCb);
        });
    };

    semiCloseSlider = () => {
        Animated.timing(
            this.state.topPosition,
            {
                toValue: SCREEN_HEIGHT,
                duration: sliderAnimationConfig.duration,
            }
        ).start()
    };

    headerRightButton = () => {
        const { option } = this.props;
        if (option != null && option.select === true && option.smartReply !== true) {
            return (
                <View
                    style={styles.rightButton}
                >
                    <Text onPress={this.onDonePress.bind(this)} style={styles.rightButtonText}>{I18n.t('Done')}</Text>
                </View>

            )
        } else {
            return (
                <View
                    {...this._panResponder.panHandlers}
                    style={styles.rightButton}
                >
                    <Text />
                </View>
            )
        }
    }

    onDonePress = () => {
        const { option } = this.props
        let messageToSend = [];

        this.state.selectedRows.forEach((row) => {
            if (row.isSelected === true) {
                messageToSend.push(this.state.messageArray[row.id[0]]);
            }
        });
        let doneFunction = option.doneFunction;
        if (doneFunction != null) {
            doneFunction(messageToSend);
        }

        this.closeSlider();
    }


    onRowsSelect(index, i) {
        let rowID = {
            id: [index, i],
        };
        const { option } = this.props

        if (option && option.smartReply === true && option.tapFunction) {
            const messageSelected = this.state.messageArray[index];
            this.closeSlider(function () {
                option.tapFunction([messageSelected]);
            });
            return;
        }

        let tempSelectedArray = [...this.state.selectedRows];
        if (option && option.select === true && option.multiSelect === true) {
            for (let idx = 0; idx < this.state.selectedRows.length; idx++) {
                if (this.state.selectedRows[idx].id[0] === index && this.state.selectedRows[idx].id[1] === i) {
                    tempSelectedArray[idx].isSelected = !tempSelectedArray[idx].isSelected
                    this.setState({ selectedRows: [...tempSelectedArray] })
                    return
                }
            }
        } else if (option && option.select === true && option.multiSelect === false) {
            this.state.selectedRows.map((row, idx) => {
                if (row.id[0] !== index && row.id[1] !== i) { tempSelectedArray[idx].isSelected = false; }
            });

            for (let idx = 0; idx < this.state.selectedRows.length; idx++) {
                if (this.state.selectedRows[idx].id[0] === index && this.state.selectedRows[idx].id[1] === i) {
                    tempSelectedArray[idx].isSelected = !tempSelectedArray[idx].isSelected
                    this.setState({ selectedRows: [...tempSelectedArray] })
                    return;
                }
            }
        }
        if (option && option.select === true) {
            this.setState({ selectedRows: [...this.state.selectedRows, { ...rowID, isSelected: true }] });
        }
    }

    renderCheckbox = (index, i) => {
        const { option } = this.props
        let selected = false;
        this.state.selectedRows.map((row, idx) => {
            if (row.id[0] === index) {
                selected = row.isSelected;
            }
        });

        if (option && option.select === true && option.smartReply !== true) {
            return (
                <CheckBox
                    containerStyle={styles.checkboxContainer}
                    style={styles.checkboxIconStyle}
                    uncheckedIcon={checkBoxConfig.uncheckedIcon}
                    checkedIcon={checkBoxConfig.checkedIcon}
                    checkedColor={checkBoxConfig.checkedColor}
                    iconType={checkBoxConfig.iconType}
                    checked={selected}
                    onPress={() => this.onRowsSelect(index, i)}
                />
            )
        }
    };

    renderInfoButton = (index) => {
        if (this.state.messageArray[index].data || this.state.messageArray[index].url) {
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
                    <Image source={images.btn_info} style={styles.infoIconStyle} />
                </TouchableOpacity>
            );
        }
    }

    renderMessage = (message, index) => {
        return (
            <TouchableOpacity style={styles.textContainer} onPress={() => this.onRowsSelect(index, index)}>
                <View style={styles.textContainer}>
                    <Text
                        style={styles.textStyle}
                        ellipsizeMode="tail"
                    >
                        {message.title}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    }

    fireInfoPopUp(dataObject) {
        Actions.info({ data: dataObject, height: INFOPOPUP_HEIGHT });
    }

    fireWebView(dataObject) {
        Actions.webview({ url: dataObject.url });
    }

    heightStyle() {
        if (this.state.sliderState === SliderStates.INITIAL) {
            return { height: 0 };
        } else if (this.state.sliderState === SliderStates.LOADING) {
            return { 'height': this.state.animatedInitialHeight };
        } else if (this.state.sliderState === SliderStates.LOADED) {
            const height = this.state.topPosition.interpolate({
                inputRange: [SCREEN_HEIGHT - this.maxHeight, SCREEN_HEIGHT - sliderAnimationConfig.minimizedHeight],
                outputRange: [this.maxHeight, 0 + sliderAnimationConfig.minimizedHeight],
                extrapolate: 'clamp'
            });
            return { 'height': height };
        } else {
            const height = this.state.topPosition.interpolate({
                inputRange: [SCREEN_HEIGHT - this.maxHeight, SCREEN_HEIGHT - sliderAnimationConfig.minimizedHeight],
                outputRange: [this.maxHeight, 0],
                extrapolate: 'clamp'
            });
            return { 'height': height };
        }
    }

    animateSlider = () => {
        this.setState({
            sliderState: SliderStates.LOADING
        });
        this.state.animatedInitialHeight.setValue(0)
        Animated.timing(
            this.state.animatedInitialHeight,
            {
                toValue: this.maxHeight,
                duration: sliderAnimationConfig.duration,
            }
        ).start(() => {
            this.setState({ sliderState: SliderStates.LOADED });
            if (this.props.onSliderOpen) {
                this.props.onSliderOpen();
            }
        });
    }

    onItemLayout = (event, index) => {
        if (this.itemHeights[index] === undefined) {
            var { height } = event.nativeEvent.layout;
            this.totalItemHeight += height;
            this.itemHeights[index] = height;
            this.layoutCalculatedItemsCount += 1;
        }

        if (this.state.messageArray.length === this.layoutCalculatedItemsCount) {
            var maxHeight = this.maxSliderHeight();
            this.maxHeight = this.totalItemHeight + HEADER_HEIGHT > maxHeight ? maxHeight : this.totalItemHeight + HEADER_HEIGHT
            this.setState({ sliderState: SliderStates.LOADING }, () => {
                this.animateSlider();
            });
        }
    }

    render() {

        return (
            <Animated.View style={this.heightStyle()}>
                <View
                    style={styles.headerView}
                >
                    <View style={{ flex: 1 }}>
                        <TouchableOpacity style={styles.closeButton} onPress={this.closeSlider.bind(this)}>
                            {Icons.sliderClose()}
                        </TouchableOpacity>
                    </View>
                    <View
                        {...this._panResponder.panHandlers}
                        style={styles.sliderIconView}
                    >
                        <Image source={images.icn_slider} style={styles.sliderIconImg} />
                    </View>
                    {
                        this.headerRightButton()
                    }
                </View>
                <ScrollView keyboardShouldPersistTaps="handled" style={styles.scrollView}>
                    {
                        this.state.messageArray.map((message, index) => {
                            return (
                                <View style={styles.listContainer1} key={index} onLayout={(event) => {this.onItemLayout(event, index)}}>
                                    <View style={styles.listcontainer2} >
                                        {this.renderCheckbox(index, index)}
                                        {this.renderMessage(message, index)}
                                        {this.renderInfoButton(index)}
                                    </View>
                                </View>
                            )
                        })
                    }
                </ScrollView>
            </Animated.View>
        );
    }

}
