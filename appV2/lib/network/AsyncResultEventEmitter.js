// Ensuring only one of this exists via exports
import EventEmitter from 'react-native/Libraries/vendor/emitter/EventEmitter';
let AsyncResultEventEmitter = new EventEmitter();

export default AsyncResultEventEmitter;
