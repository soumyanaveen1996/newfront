/**
 * Images:
 *
 * var Images =require('./images')
 *
 * Images['logo'];  
 */
import { Platform } from 'react-native';
import ios_images from '../images/ios';
import android_images from '../images/android';

const images =  (Platform.OS === 'ios') ? ios_images : android_images

export default images;
