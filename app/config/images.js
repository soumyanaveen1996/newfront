/**
 * Images:
 *
 * var Images =require('./images')
 *
 * Images['logo'];
 */
import images_static from '../images';
//import android_images from '../images/android';

//const images =  (Platform.OS === 'ios') ? ios_images : android_images

const images = images_static;

export default images;
