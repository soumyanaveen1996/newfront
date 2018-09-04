import React from 'react';
import FloatingButtonItem from './FloatingButtonItem';
import {
    Text,
    View,
    Animated,
    TouchableOpacity
} from 'react-native';
import styles, { overlayStyle,
    actionStyle,
    mainButtonAnimatedViewStyle,
    overlayTappableStyle
} from './styles';

export default class FloatingButton extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            reset: props.reset,
            active: props.active
        };

        this.anim = new Animated.Value(props.active ? 1 : 0);
        this.timeout = null;
    }

    componentWillUnmount() {
        clearTimeout(this.timeout);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.reset !== this.state.reset) {
            if (nextProps.active === false && this.state.active === true) {
                Animated.spring(this.anim, { toValue: 0 }).start();
                setTimeout(
                    () =>
                        this.setState({ active: false, reset: nextProps.reset }),
                    250
                );
                return;
            }

            if (nextProps.active === true && this.state.active === false) {
                Animated.spring(this.anim, { toValue: 1 }).start();
                this.setState({ active: true, reset: nextProps.reset });
                return;
            }

            this.setState({
                reset: nextProps.reset,
                active: nextProps.active
            });
        }
    }


    render() {
        return (
            <View style={[overlayStyle(this.props)]} pointerEvents="box-none">
                <View
                    pointerEvents="box-none"
                    style={[
                        overlayStyle(this.props),
                        styles.orientation,
                    ]}>
                    { this.state.active && this.renderTappableBackground() }
                    { this.props.children && this.renderItems()}
                    { this.renderMainButton() }
                </View>
            </View>
        );
    }

    renderMainButton() {
        return (
            <View style={[styles.mainButtonContainer, {zIndex: this.props.zIndex}]}>
                <TouchableOpacity
                    onPress={() => {
                        if (this.props.onPress) {
                            this.props.onPress();
                        }
                        if (this.props.children) {this.animateButton();}
                    }}>
                    <Animated.View
                        style={[]}>
                        <Animated.View style={[styles.mainButton, mainButtonAnimatedViewStyle(this.anim)]}>
                            {this.renderButtonIcon()}
                        </Animated.View>
                    </Animated.View>
                </TouchableOpacity>
            </View>
        );
    }

    renderButtonIcon() {
        return <Text allowFontScaling={false} style={styles.buttonText}>{this.props.buttonText}</Text>;
    }

    renderItems() {
        const { children } = this.props;

        if (!this.state.active) {return null;}

        const actionButtons = !Array.isArray(children) ? [children] : children;

        return (
            <View style={actionStyle(this.props)} pointerEvents={'box-none'}>
                {actionButtons.map((button, idx) => (
                    <FloatingButtonItem
                        key={idx}
                        anim={this.anim}
                        {...this.props}
                        {...button.props}
                        onPress={() => {
                            button.props.onPress();
                        }}/>
                ))}
            </View>
        );
    }

    renderTappableBackground() {
        return (
            <TouchableOpacity
                activeOpacity={1}
                style={overlayTappableStyle(this.props)}
                onPress={this.reset.bind(this)}
            />
        );
    }

    animateButton(animate = true) {
        if (this.state.active) {return this.reset();}

        if (animate) {
            Animated.spring(this.anim, { toValue: 1 }).start();
        } else {
            this.anim.setValue(1);
        }

        this.setState({ active: true, reset: this.state.reset });
    }

    reset(animate = true) {
        if (animate) {
            Animated.spring(this.anim, { toValue: 0 }).start();
        } else {
            this.anim.setValue(0);
        }

        setTimeout(
            () => this.setState({ active: false, reset: this.state.reset }),
            250
        );
    }
}

FloatingButton.Item = FloatingButtonItem;

FloatingButton.defaultProps = {
    buttonText: '+',
};
