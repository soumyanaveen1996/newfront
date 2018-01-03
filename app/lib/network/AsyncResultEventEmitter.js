// Ensuring only one of this exists via exports
import EventEmitter from 'EventEmitter';
let AsyncResultEventEmitter = new EventEmitter();

export default AsyncResultEventEmitter;
