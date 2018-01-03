import { StyleSheet } from 'react-native';
import { GlobalColors } from '../../config/styles'

const stylesheet = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: GlobalColors.black,
    },
    image: {
        flex: 1,
    },
    toolbar: {
        height: 44,
        flexDirection: 'row',
        backgroundColor: 'rgb(248, 248, 248)',
        alignItems: 'center',
        paddingVertical: 7,
        borderTopWidth: 1,
        borderColor: 'rgb(202, 206, 204)',
    },
    saveIcon: {
        marginLeft: 10
    }
});


export default stylesheet;
