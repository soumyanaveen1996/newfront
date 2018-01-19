import Contact from './Contact';
import DeviceStorage from './DeviceStorage';
import Network from './Network';
import Promise from './Promise';
import Utils from './Utils';
import Message from './Message';
import { MessageTypeConstants, ButtonStyle }  from './Message';
import { NetworkRequest, futureRequest } from './Network';
import ConversationContext from './ConversationContext';
import Auth from './Auth';
import Media from './Media';
import Notification from './Notification';
import Resource, { ResourceTypes } from './Resource';
import { AUTH_PROVIDERS } from './Auth';

const version = '1.0'; // Keeps getting bumped if new capabilities are added (after release 1)

export {
    Contact,
    DeviceStorage,
    Network,
    Promise,
    Utils,
    Message,
    NetworkRequest,
    futureRequest,
    MessageTypeConstants,
    Notification,
    ConversationContext,
    Auth,
    AUTH_PROVIDERS,
    Media,
    Resource,
    ResourceTypes,
    ButtonStyle,
    version
};
