import Contact from './Contact';
import DeviceStorage from './DeviceStorage';
import Network from './Network';
import Promise from './Promise';
import Utils from './Utils';
import Channel from './Channel';
import Message from './Message';
import Messages from './Messages';
import {
    MessageTypeConstants,
    ButtonStyle,
    MessageTypeConstantsToInt
} from './Message';
import { NetworkRequest, futureRequest } from './Network';
import ConversationContext from './ConversationContext';
import Auth from './Auth';
import Media from './Media';
import Notification from './Notification';
import Settings, { PollingStrategyTypes } from './Settings';
import Resource, { ResourceTypes } from './Resource';
import { AUTH_PROVIDERS } from './Auth';
import DeviceLocation from './DeviceLocation';
import Telnet from './Telnet';
import BotState from './BotState';
import BackgroundTaskQueue from './BackgroundTaskQueue';
import MessageQuota from './MessageQuota';
import UpdateCallQuota from './CallQuota';
import RemoteBotInstall from '../RemoteBotInstall';
import InAppPurchase from './InAppPurchase';
import OfflineMap from './OfflineMap';
const version = '1.1'; // Keeps getting bumped if new capabilities are added (after release 1)

export {
    Contact,
    DeviceStorage,
    Network,
    Promise,
    Utils,
    Message,
    Messages,
    NetworkRequest,
    futureRequest,
    MessageTypeConstants,
    MessageTypeConstantsToInt,
    Notification,
    ConversationContext,
    Auth,
    AUTH_PROVIDERS,
    Media,
    Resource,
    ResourceTypes,
    ButtonStyle,
    Channel,
    Settings,
    PollingStrategyTypes,
    version,
    DeviceLocation,
    Telnet,
    BotState,
    BackgroundTaskQueue,
    MessageQuota,
    UpdateCallQuota,
    RemoteBotInstall,
    InAppPurchase,
    OfflineMap
};
