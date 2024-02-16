import { TextInput } from 'react-native';

export const setCustomTextInput = (customProps) => {
    if (TextInput.defaultProps == null) {
        TextInput.defaultProps = {};
        TextInput.defaultProps.allowFontScaling = false;
    }
    const initialDefaultProps = TextInput.defaultProps;
    TextInput.defaultProps = {
        ...initialDefaultProps
    };
    const sourceRender = TextInput.render;
    TextInput.render = function render(props, ref) {
        return sourceRender.apply(this, [
            {
                ...props,
                style: [{ fontFamily: 'Figtree' }, props.style]
            },
            ref
        ]);
    };
};
