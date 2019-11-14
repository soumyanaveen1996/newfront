import Contact from './Contact';
import DeviceStorage from './DeviceStorage';
import Network from './Network';
import Network_http from './Network_http';
import Promise from './Promise';
import Utils from './Utils';
import Channel from './Channel';
import Message from './Message';
import Messages from './Messages';
import AgentGuard from './AgentGuard';
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
import LocationTracker from './LocationTracker';
import Telnet from './Telnet';
import BotState from './BotState';
import BackgroundTaskQueue from './BackgroundTaskQueue';
import MessageQuota from './MessageQuota';
import RemoteBotInstall from '../RemoteBotInstall';
import OfflineMap from './OfflineMap';
import { Moment, MomentTimezone } from './Moment';
import { Immutable } from './Immutable';
import { R } from './Ramda';
import { Accelerometer } from './Sensors';
import { UpdateCallQuota, CallQuota } from './CallQuota';
import { InAppPurchase } from './InAppPurchase';
const version = '1.1'; // Keeps getting bumped if new capabilities are added (after release 1)

export {
    Accelerometer,
    AgentGuard,
    Auth,
    AUTH_PROVIDERS,
    BackgroundTaskQueue,
    BotState,
    ButtonStyle,
    Channel,
    Contact,
    ConversationContext,
    DeviceLocation,
    DeviceStorage,
    futureRequest,
    Immutable,
    InAppPurchase,
    LocationTracker,
    Media,
    Message,
    MessageQuota,
    Messages,
    MessageTypeConstants,
    MessageTypeConstantsToInt,
    Moment,
    MomentTimezone,
    Network,
    Network_http,
    NetworkRequest,
    Notification,
    OfflineMap,
    PollingStrategyTypes,
    Promise,
    R,
    RemoteBotInstall,
    Resource,
    ResourceTypes,
    Settings,
    Telnet,
    Utils,
    version,
    UpdateCallQuota,
    CallQuota
};
