import React, { Component } from 'react';
import { Image, View, ActivityIndicator } from 'react-native';
import styles from './styles';
import ImageLoad from 'react-native-image-placeholder';

export default class LogoImage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loaded: false
        };
    }

    componentWillMount() {
        if (this.props.source) {
            console.log('Mount Image');
            this.setState({ loaded: true });
        }
    }

    render() {
        return (
            <ImageLoad
                style={this.props.imageStyle}
                source={this.props.source}
                borderRadius={this.props.imageStyle.width / 2}
                resizeMode={this.props.resizeMode || 'cover'}
                isShowActivity={false}
                placeholderStyle={this.props.imageStyle}
                placeholderSource={require('../../images/avatar-icon-placeholder/Default_Image_Thumbnail.png')}
                resizeMode={this.props.resizeMode || 'contain'}
            />
        );
    }

    // render() {
    //     return (
    //         <View>
    //             <Image
    //                 source={this.props.source}
    //                 resizeMode={'contain'}
    //                 style={this.props.imageStyle}
    //                 onLoadEnd={this.onLoad}
    //             />
    //             {false && !this.state.loaded && (
    //                 <View
    //                     style={
    //                         this.props.loadingStyle === undefined
    //                             ? styles.loading
    //                             : this.props.loadingStyle
    //                     }
    //                 >
    //                     <ActivityIndicator size="small" />
    //                 </View>
    //             )}
    //         </View>
    //     );
    // }

    // onLoad = () => {
    //     if (!this.state.loaded) {
    //         this.setState(() => ({ loaded: true }));
    //     }
    // };
}
