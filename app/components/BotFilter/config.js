import { GlobalColors } from '../../config/styles';

export const TextColor = 'rgb(51, 52, 58)';
const SearchInput = {
    textColor: TextColor,
    placeHolderTextColor: 'rgb(164, 164, 164)',
    underlineColor: GlobalColors.transparent,
};
export const BotFilter = {
    height: 450,
    deltaHeightWithKeyboard: 100,
    animationDuration: 400
}

export default {
    SearchInput,
    TextColor,
    BotFilter,
};
