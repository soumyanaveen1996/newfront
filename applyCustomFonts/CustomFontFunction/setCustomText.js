import { Text } from 'react-native';

export const setCustomText = (customProps) => {
    if (Text.defaultProps == null) {
        Text.defaultProps = {};
        Text.defaultProps.allowFontScaling = false;
    }
    const initialDefaultProps = Text.defaultProps;
    Text.defaultProps = {
        ...initialDefaultProps
    };
    const sourceRender = Text.render;
    Text.render = function render(props, ref) {
        return sourceRender.apply(this, [
            {
                ...props,
                style: [{ fontFamily: 'Figtree' }, props.style]
            },
            ref
        ]);
    };
};
