import moment from 'moment';
import { MessageHandler } from '../message';
import I18n from '../../config/i18n/i18n';
import _ from 'lodash';
import { UUID } from './Utils';


export const ButtonStyle = {
    light: 0,
    bright: 1,
}

export const MessageTypeConstants = {
    MESSAGE_TYPE_STRING: 'string',
    MESSAGE_TYPE_LIST: 'list',
    MESSAGE_TYPE_SLIDER: 'slider',
    MESSAGE_TYPE_BUTTON: 'button',
    MESSAGE_TYPE_FORM: 'form',
    MESSAGE_TYPE_HTML: 'html',
    MESSAGE_TYPE_IMAGE: 'image',
    MESSAGE_TYPE_VIDEO: 'video',
    MESSAGE_TYPE_MAP: 'map',
    MESSAGE_TYPE_SLIDER_RESPONSE: 'slider_response',
    MESSAGE_TYPE_SLIDER_CANCEL: 'slider_cancel',
    MESSAGE_TYPE_BUTTON_RESPONSE: 'button_response',
    MESSAGE_TYPE_FORM_RESPONSE: 'form_response',
    MESSAGE_TYPE_AUDIO: 'audio',
    MESSAGE_TYPE_CHART: 'chart',
    MESSAGE_TYPE_WAIT: 'wait',
    MESSAGE_TYPE_SESSION_START: 'session_start',
    MESSAGE_TYPE_BARCODE: 'barcode',
    MESSAGE_TYPE_FORM_OPEN: 'form_open',
    MESSAGE_TYPE_FORM_CANCEL: 'form_cancel',
};


export const IntToMessageTypeConstants = {
    10: MessageTypeConstants.MESSAGE_TYPE_STRING,
    30: MessageTypeConstants.MESSAGE_TYPE_IMAGE,
    40: MessageTypeConstants.MESSAGE_TYPE_VIDEO,
    60: MessageTypeConstants.MESSAGE_TYPE_AUDIO,
    140: MessageTypeConstants.MESSAGE_TYPE_HTML,
    200: MessageTypeConstants.MESSAGE_TYPE_LIST,
    210: MessageTypeConstants.MESSAGE_TYPE_SLIDER,
    220: MessageTypeConstants.MESSAGE_TYPE_BUTTON,
    230: MessageTypeConstants.MESSAGE_TYPE_FORM,
    240: MessageTypeConstants.MESSAGE_TYPE_MAP
};

export const MessageTypeConstantsToInt = _.invert(IntToMessageTypeConstants)

export default class Message {
    constructor(opts) {
        // Opts can be passed to revive a message from storage
        // Properties cannot be of "object" data type since they cannot be persisted by sqlite
        // So the getter and setters jsonify them
        opts = opts || {};
        this._msg = opts.msg || null;
        this._messageType = opts.messageType || null;
        this._options = opts.options || null;
        this._addedByBot = opts.addedByBot || false;
        this._uuid = opts.uuid || UUID();
        // We will use moment in order manage local and remote times better
        this._messageDate = opts.messageDate ? moment(opts.messageDate).toDate() : moment().toDate();
        // Required only for persistence - to indicate which bot stored it
        this._botKey = opts.botKey || null;
        this._isRead = opts.isRead;
        this._isFavorite = opts.isFavorite;
        // userUUID or the botUUID for tracking in conversations
        this._createdBy = opts.createdBy;
        this._completed = opts.completed || false;
    }

    /**
     * Returns the count of messages that the user has sent (response messages aren't counted).
     * This is at a class level since we do not need it on every Message object
     *
     * @param botKey A string key to indicate the identifier of bot
     * @param option supports the following:
     *  null/empty (all messages)
     *  day (last 24 hours)
     *  week (last 7 days)
     *  month (since last month)
     *  startOfMonth (since start of this month)
     *  date (since any date - javascript)
     *
     * @return Promise that resolves to count of users messages of the bot.
     */
    static userMessageCountSince = (botKey, option) => new Promise((resolve, reject) => {
        return resolve(MessageHandler.userMessageCountSince(botKey, option));
    });

    stringMessage = (str) => {
        this._msg = str;
        this._messageType = MessageTypeConstants.MESSAGE_TYPE_STRING;
    };

    imageMessage = (imageUrl) => {
        // TODO: validate a valid url? - string for now
        this._msg = imageUrl;
        this._messageType = MessageTypeConstants.MESSAGE_TYPE_IMAGE;
    };

    videoMessage = (videoUrl) => {
        // TODO: validate a valid url? - string for now
        this._msg = videoUrl;
        this._messageType = MessageTypeConstants.MESSAGE_TYPE_VIDEO;
    };

    audioMessage = (audioUrl) => {
        // TODO: validate a valid url? - string for now
        this._msg = audioUrl;
        this._messageType = MessageTypeConstants.MESSAGE_TYPE_AUDIO;
    };

    sessionStartMessage = (data) => {
        this._msg = JSON.stringify(data || {});
        this._messageType = MessageTypeConstants.MESSAGE_TYPE_SESSION_START;
    };

    listMessage = (arrayData) => {
        this._msg = JSON.stringify(arrayData);
        this._messageType = MessageTypeConstants.MESSAGE_TYPE_LIST;
    };

    barcodeMessage = (str) => {
        this._msg = str;
        this._messageType = MessageTypeConstants.MESSAGE_TYPE_BARCODE;
    };

    /**
     * Store complex response and options for sliders
     * @param sliderData - json object of data - will be stringified
     * @param options - json object of options - will be stringified
     */
    sliderMessage = (sliderData, options) => {
        this._msg = JSON.stringify(sliderData || []);
        if (options) {
            this._options = JSON.stringify(options);
        }
        this._messageType = MessageTypeConstants.MESSAGE_TYPE_SLIDER;
    };

    sliderResponseMessage = (sliderData, options) => {
        this._msg = JSON.stringify(sliderData || []);
        if (options) {
            this._options = JSON.stringify(options);
        }
        this._messageType = MessageTypeConstants.MESSAGE_TYPE_SLIDER_RESPONSE;
    };

    buttonMessage = (buttonData, options) => {
        this._msg = JSON.stringify(buttonData || []);
        if (options) {
            this._options = JSON.stringify(options);
        }
        this._messageType = MessageTypeConstants.MESSAGE_TYPE_BUTTON;
    };

    buttonResponseMessage = (buttonData, options) => {
        this._msg = JSON.stringify(buttonData || []);
        if (options) {
            this._options = JSON.stringify(options);
        }
        this._messageType = MessageTypeConstants.MESSAGE_TYPE_BUTTON_RESPONSE;
    };

    formMessage = (formData, options) => {
        this._msg = JSON.stringify(formData || []);
        if (options) {
            this._options = JSON.stringify(options);
        }
        this._messageType = MessageTypeConstants.MESSAGE_TYPE_FORM;
    };

    formOpenMessage = (formData) => {
        this._msg = JSON.stringify(formData || []);
        this._messageType = MessageTypeConstants.MESSAGE_TYPE_FORM_OPEN;
    }

    formCancelMessage = (formData) => {
        this._msg = JSON.stringify(formData || []);
        this._messageType = MessageTypeConstants.MESSAGE_TYPE_FORM_CANCEL;
    }

    sliderCancelMessage = () => {
        this._msg = JSON.stringify('');
        this._messageType = MessageTypeConstants.MESSAGE_TYPE_SLIDER_CANCEL;
    }

    formResponseMessage = (formData, options) => {
        this._msg = JSON.stringify(formData || []);
        if (options) {
            this._options = JSON.stringify(options);
        }
        this._messageType = MessageTypeConstants.MESSAGE_TYPE_FORM_RESPONSE;
    };

    htmlMessage = (htmlData, options) => {
        this._msg = JSON.stringify(htmlData || []);
        if (options) {
            this._options = JSON.stringify(options);
        }
        this._messageType = MessageTypeConstants.MESSAGE_TYPE_HTML;
    };

    mapMessage = (mapData, options) => {
        this._msg = JSON.stringify(mapData || []);
        if (options) {
            this._options = JSON.stringify(options);
        }
        this._messageType = MessageTypeConstants.MESSAGE_TYPE_MAP;
    }

    chartMessage = (data, options) => {
        this._msg = JSON.stringify(data || []);
        if (options) {
            this._options = JSON.stringify(options);
        }
        this._messageType = MessageTypeConstants.MESSAGE_TYPE_CHART;
    }

    waitMessage = () => {
        this._msg = JSON.stringify('');
        this._messageType = MessageTypeConstants.MESSAGE_TYPE_WAIT;
    }

    messageByBot = (option = true) => {
        this._addedByBot = option;
    };

    getMessageString = () => {
        return this._msg;
    }

    getMessage = () => {
        if (this._messageType === MessageTypeConstants.MESSAGE_TYPE_SLIDER
            || this._messageType === MessageTypeConstants.MESSAGE_TYPE_BUTTON
            || this._messageType === MessageTypeConstants.MESSAGE_TYPE_FORM
            || this._messageType === MessageTypeConstants.MESSAGE_TYPE_LIST
            || this._messageType === MessageTypeConstants.MESSAGE_TYPE_MAP
            || this._messageType === MessageTypeConstants.MESSAGE_TYPE_BUTTON_RESPONSE
            || this._messageType === MessageTypeConstants.MESSAGE_TYPE_FORM_RESPONSE
            || this._messageType === MessageTypeConstants.MESSAGE_TYPE_FORM_CANCEL
            || this._messageType === MessageTypeConstants.MESSAGE_TYPE_SLIDER_CANCEL
            || this._messageType === MessageTypeConstants.MESSAGE_TYPE_FORM_OPEN
            || this._messageType === MessageTypeConstants.MESSAGE_TYPE_CHART
            || this._messageType === MessageTypeConstants.MESSAGE_TYPE_HTML
            || this._messageType === MessageTypeConstants.MESSAGE_TYPE_SLIDER_RESPONSE
            || this._messageType === MessageTypeConstants.MESSAGE_TYPE_SESSION_START) {
            try {
                return JSON.parse(this._msg);
            } catch (error) {
                // bubble the error
                throw error;
            }
        }

        return this._msg;
    };

    getDisplayMessage = () => {
        // TODO(amal): Have to handle other message types.
        if (this._messageType === MessageTypeConstants.MESSAGE_TYPE_SLIDER_RESPONSE) {
            let items = this.getMessage();
            if (items.length > 0) {
                let titles = _.map(items, (item) => item.title)
                return I18n.t('Slider_Response', { lines: titles.join('\n') })
            } else {
                return null;
            }
        } else if (this._messageType === MessageTypeConstants.MESSAGE_TYPE_BUTTON_RESPONSE) {
            let item = this.getMessage();
            return I18n.t('Slider_Response_Message', { lines: item.title })
        } else if (this._messageType === MessageTypeConstants.MESSAGE_TYPE_FORM_RESPONSE) {
            let items = this.getMessage();
            let titles = _.map(items, (item) => item.value !== undefined ? item.title + ':' + item.value : '')
            return I18n.t('Slider_Response_Message', { lines: titles.join('\n') })
        } else if (this._messageType === MessageTypeConstants.MESSAGE_TYPE_HTML) {
            return this.getMessage().actionText
        } else if (this._messageType === MessageTypeConstants.MESSAGE_TYPE_FORM) {
            return 'form'
        } else if (this._messageType === MessageTypeConstants.MESSAGE_TYPE_WAIT) {
            return ''
        } else if (this._messageType === MessageTypeConstants.MESSAGE_TYPE_SESSION_START) {
            return ''
        } else if (this._messageType === MessageTypeConstants.MESSAGE_TYPE_AUDIO) {
            return 'Audio'
        } else if (this._messageType === MessageTypeConstants.MESSAGE_TYPE_VIDEO) {
            return 'Video'
        } else if (this._messageType === MessageTypeConstants.MESSAGE_TYPE_FORM_OPEN) {
            return ''
        } else if (this._messageType === MessageTypeConstants.MESSAGE_TYPE_FORM_CANCEL) {
            return ''
        } else if (this._messageType === MessageTypeConstants.MESSAGE_TYPE_SLIDER_CANCEL) {
            return ''
        } else {
            return this.getMessage();
        }
    }

    getMessageType = () => {
        return this._messageType;
    };

    getMessageOptionsString = () => {
        if (!this._options) {
            return null;
        }
        if (typeof this._options === 'string') {
            return this._options;
        }
        return JSON.stringify(this._options);
    }

    getMessageOptions = () => {
        if (!this._options) {
            return null;
        }
        if (this._messageType === MessageTypeConstants.MESSAGE_TYPE_SLIDER
            || this._messageType === MessageTypeConstants.MESSAGE_TYPE_SLIDER_RESPONSE
            || this._messageType === MessageTypeConstants.MESSAGE_TYPE_BUTTON
            || this._messageType === MessageTypeConstants.MESSAGE_TYPE_BUTTON_RESPONSE
            || this._messageType === MessageTypeConstants.MESSAGE_TYPE_FORM
            || this._messageType === MessageTypeConstants.MESSAGE_TYPE_FORM_RESPONSE
            || this._messageType === MessageTypeConstants.MESSAGE_TYPE_HTML
            || this._messageType === MessageTypeConstants.MESSAGE_TYPE_LIST
            || this._messageType === MessageTypeConstants.MESSAGE_TYPE_WAIT
            || this._messageType === MessageTypeConstants.MESSAGE_TYPE_FORM_OPEN
            || this._messageType === MessageTypeConstants.MESSAGE_TYPE_FORM_CANCEL
            || this._messageType === MessageTypeConstants.MESSAGE_TYPE_SLIDER_CANCEL
            || this._messageType === MessageTypeConstants.MESSAGE_TYPE_SESSION_START) {
            try {
                return JSON.parse(this._options);
            } catch (error) {
                // bubble the error
                throw error;
            }
        }
        return this._options;
    };

    // Return true or false. True if message was added by bot. False otherwise.
    isMessageByBot = () => {
        return this._addedByBot;
    };

    getMessageId = () => {
        return this._uuid;
    };

    getMessageDate = () => {
        return this._messageDate;
    };

    // Only for persistence
    setBotKey = (botKey) => {
        this._botKey = botKey;
    };

    getBotKey = () => {
        return this._botKey;
    };

    setCreatedBy = (byUuid) => {
        this._createdBy = byUuid;
    };

    getCreatedBy = () => {
        return this._createdBy;
    };

    /**
     * Return a JSON object representing the message - for persistence / to send to remote server etc
     *
     * @return JSON of this message
     */
    toJSON = () => {
        // Manually curated for now
        return {
            msg: this.getMessage(),
            messageType: this.getMessageType(),
            options: this.getMessageOptions(),
            addedByBot: this.isMessageByBot(),
            messageId: this.getMessageId(),
            uuid: this.getMessageId(),
            messageDate: this.getMessageDate(),
            botKey: this.getBotKey(),
            createdBy: this.getCreatedBy()
        };
    };

    /**
     * Return an object with key which is the id of this message, and the message itself.
     * This is a representation that is used when used for display in bots
     *
     * @return object
     */
    toBotDisplay = () => {
        return { 'key': this.getMessageId(), 'message': this };
    };

    isRead = () => {
        return this._isRead;
    }

    setRead(read = true) {
        this._isRead = read;
    }

    isFavorite = () => {
        return this._isFavorite;
    }

    setFavorite(favorite = false) {
        this._isFavorite = favorite;
    }

    setCompleted(completed = false) {
        this._completed = completed;
    }

    isCompleted() {
        return this._completed;
    }

    static from(json, user) {
        const messageType = IntToMessageTypeConstants[json.contentType];
        let options = {
            messageType: messageType,
            uuid: json.messageUuid,
            addedByBot: user && (user.userId === json.createdBy) ? 0 : 1,
            botKey: json.conversation,
            msg: json.content[0],
            isRead: true,
            isFavorite: false,
            createdBy: json.createdBy,
            messageDate: parseInt(json.createdOn.$numberLong, 10)
        }
        return new Message(options);
    }
}

