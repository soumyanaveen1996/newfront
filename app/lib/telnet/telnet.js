'use strict'

import events from 'events';
import net from 'react-native-tcp';
import { Duplex } from 'stream';
import utils from './utils';

module.exports = class Telnet extends events.EventEmitter {
    constructor() {
        super()

        this.socket = null
        this.state = null
    }

    connect(opts) {
        return new Promise((resolve, reject) => {
            const host = (typeof opts.host !== 'undefined' ? opts.host : '127.0.0.1')
            const port = (typeof opts.port !== 'undefined' ? opts.port : 23)
            this.timeout = (typeof opts.timeout !== 'undefined' ? opts.timeout : 500)

            // Set prompt regex defaults
            this.shellPrompt = (typeof opts.shellPrompt !== 'undefined' ? opts.shellPrompt : /(?:\/ )?#\s/)
            console.log('Lama : Shell prompt : ', this.shellPrompt);
            this.loginPrompt = (typeof opts.loginPrompt !== 'undefined' ? opts.loginPrompt : /login[: ]*$/i)
            this.passwordPrompt = (typeof opts.passwordPrompt !== 'undefined' ? opts.passwordPrompt : /Password[: ]*$/i)
            this.failedLoginMatch = opts.failedLoginMatch
            this.loginPromptReceived = false

            this.debug = (typeof opts.debug !== 'undefined' ? opts.debug : false)
            this.username = (typeof opts.username !== 'undefined' ? opts.username : 'root')
            this.password = (typeof opts.password !== 'undefined' ? opts.password : 'guest')
            this.irs = (typeof opts.irs !== 'undefined' ? opts.irs : '\r\n')
            this.ors = (typeof opts.ors !== 'undefined' ? opts.ors : '\n')
            this.echoLines = (typeof opts.echoLines !== 'undefined' ? opts.echoLines : 1)
            this.stripShellPrompt = (typeof opts.stripShellPrompt !== 'undefined' ? opts.stripShellPrompt : true)
            this.pageSeparator = (typeof opts.pageSeparator !== 'undefined' ?
                opts.pageSeparator : '---- More')
            this.negotiationMandatory = (typeof opts.negotiationMandatory !== 'undefined' ?
                opts.negotiationMandatory : true)
            this.initialLFCR = (typeof opts.initialLFCR !== 'undefined' ? opts.initialLFCR : false)
            this.execTimeout = (typeof opts.execTimeout !== 'undefined' ? opts.execTimeout : 2000)
            this.sendTimeout = (typeof opts.sendTimeout !== 'undefined' ? opts.sendTimeout : 2000)
            this.maxBufferLength = (typeof opts.maxBufferLength !== 'undefined' ? opts.maxBufferLength : 1048576)

            this.socket = net.createConnection({
                port,
                host
            })

            this.inputBuffer = ''

            this.socket.setTimeout(this.timeout, () => {
                if (this.socket._connecting === true) {
                    /* if cannot connect, emit error and destroy */
                    this.emit('error', 'Cannot connect')
                    this.socket.destroy()
                } else {
                    this.emit('timeout')
                }
            })
            this.socket.on('connect', () => {
                console.log('Lama : Connetected');
                console.log('Lama : In connect callback')
                this.state = 'start'
                this.emit('connect')

                if (this.initialLFCR === true) {
                    this.socket.write('\r\n')
                }
                if (this.negotiationMandatory === false) {
                    resolve()
                }
            })

            this.socket.on('data', data => {
                if (this.state === 'standby') {
                    return this.emit('data', data)
                }

                this._parseData(data, (event, parsed) => {
                    if (event === 'ready') {
                        resolve(parsed)
                    }
                })
            })

            this.socket.on('error', error => {
                this.emit('error', error)
            })

            this.socket.on('end', () => {
                this.emit('end')
            })

            this.socket.on('close', () => {
                this.emit('close')
            })
        })
    }

    shell(callback) {
        return new Promise((resolve, reject) => {
            resolve(new Stream(this.socket))
        })
    }

    exec(cmd, opts, callback) {
        if (opts && opts instanceof Function) {callback = opts}

        return new Promise((resolve, reject) => {
            if (opts && opts instanceof Object) {
                this.shellPrompt = opts.shellPrompt || this.shellPrompt
                this.loginPrompt = opts.loginPrompt || this.loginPrompt
                this.failedLoginMatch = opts.failedLoginMatch || this.failedLoginMatch
                this.timeout = opts.timeout || this.timeout
                this.execTimeout = opts.execTimeout || this.execTimeout
                this.irs = opts.irs || this.irs
                this.ors = opts.ors || this.ors
                this.echoLines = (typeof opts.echoLines !== 'undefined' ? opts.echoLines : this.echoLines)
                this.maxBufferLength = opts.maxBufferLength || this.maxBufferLength
            }

            cmd += this.ors

            if (!this.socket.writable) {
                return reject(new Error('socket not writable'))
            }

            this.socket.write(cmd, () => {
                let execTimeout = null
                this.state = 'response'

                this.emit('writedone')

                this.once('responseready', responseHandler)
                this.once('bufferexceeded', buffExcHandler)

                if (this.execTimeout) {
                    execTimeout = setTimeout(() => {
                        execTimeout = null

                        this.removeListener('responseready', responseHandler)
                        this.removeListener('bufferexceeded', buffExcHandler)

                        if (!this.response) {return reject(new Error('response not received'))}
                    }, this.execTimeout)
                }

                function responseHandler() {
                    if (execTimeout !== null) {
                        clearTimeout(execTimeout)
                    }

                    if (this.response !== 'undefined') {
                        resolve(this.response.join('\n'))
                    } else {
                        reject(new Error('invalid response'))
                    }
                    console.log('Lama Response : ', this.response);

                    /* reset stored response */
                    this.inputBuffer = ''

                    /* set state back to 'standby' for possible telnet server push data */
                    this.state = 'standby'

                    this.removeListener('bufferexceeded', buffExcHandler)
                }

                function buffExcHandler() {
                    if (execTimeout !== null) {
                        clearTimeout(execTimeout)
                    }

                    if (!this.inputBuffer) {
                        return reject(new Error('response not received'))
                    }

                    resolve(this.inputBuffer)

                    /* reset stored response */
                    this.inputBuffer = ''

                    /* set state back to 'standby' for possible telnet server push data */
                    this.state = 'standby'
                }
            })
        })
    }

    send(data, opts, callback) {
        if (opts && opts instanceof Function) {
            callback = opts
        }

        return new Promise((resolve, reject) => {
            if (opts && opts instanceof Object) {
                this.ors = opts.ors || this.ors
                this.sendTimeout = opts.timeout || this.sendTimeout
                this.maxBufferLength = opts.maxBufferLength || this.maxBufferLength

                data += this.ors
            }

            if (this.socket.writable) {
                this.socket.write(data, () => {
                    let response = ''
                    this.state = 'standby'

                    this.on('data', sendHandler)

                    if ((opts && opts.waitfor === undefined) || !opts) {
                        setTimeout(() => {
                            if (response === '') {
                                this.removeListener('data', sendHandler)
                                reject(new Error('response not received'))
                                return
                            }

                            this.removeListener('data', sendHandler)
                            resolve(response)
                        }, this.sendTimeout)
                    }

                    const self = this

                    function sendHandler(sendData) {
                        response += sendData.toString()

                        if (opts && opts.waitfor !== undefined) {
                            if (!response.includes(opts.waitfor)) {return}

                            self.removeListener('data', sendHandler)
                            resolve(response)
                        }
                    }
                })
            }

        })
    }

    getSocket() {
        return this.socket
    }

    end() {
        return new Promise(resolve => {
            this.socket.end()
            resolve()
        })
    }

    destroy() {
        return new Promise(resolve => {
            this.socket.destroy()
            resolve()
        })
    }

    _parseData(chunk, callback) {
        let promptIndex = ''

        if (chunk[0] === 255 && chunk[1] !== 255) {
            this.inputBuffer = '';
            const negReturn = this._negotiate(chunk)

            if (negReturn === undefined) {
                return;
            } else {
                chunk = negReturn
            }
        }

        if (this.state === 'start') {
            this.state = 'getprompt'
        }

        if (this.state === 'getprompt') {
            const stringData = chunk.toString()

            promptIndex = utils.search(stringData, this.shellPrompt) // Check
            console.log('Lama Prompt data : ', stringData);
            if (utils.search(stringData, this.loginPrompt) !== -1) {
                /* make sure we don't end up in an infinite loop */
                if (!this.loginPromptReceived) {
                    this.state = 'login'
                    this._login('username')
                    this.loginPromptReceived = true
                } else {
                    this.emit('failedlogin', stringData)
                    this.destroy()
                }
            } else if (utils.search(stringData, this.passwordPrompt) !== -1) {
                this.state = 'login'
                this._login('password')
            } else if (typeof this.failedLoginMatch !== 'undefined' && utils.search(stringData, this.failedLoginMatch) !== -1) {
                this.state = 'failedlogin'

                this.emit('failedlogin', stringData)
                this.destroy()
            } else if (promptIndex !== -1) {
                if (!(this.shellPrompt instanceof RegExp)) {
                    this.shellPrompt = stringData.substring(promptIndex)
                }

                this.state = 'standby'
                this.inputBuffer = ''
                this.loginPromptReceived = false

                this.emit('ready', this.shellPrompt)

                if (callback) {
                    callback('ready', this.shellPrompt)
                }
            } else {
                return
            }
        } else if (this.state === 'response') {
            console.log('Lama Chunk : ', chunk.toString());
            console.log('Lama buffer lengths : ', this.inputBuffer.length, this.maxBufferLength);
            if (this.inputBuffer.length >= this.maxBufferLength) {
                return this.emit('bufferexceeded')
            }

            const stringData = chunk.toString()

            this.inputBuffer += stringData
            promptIndex = utils.search(this.inputBuffer, this.shellPrompt)

            if (promptIndex === -1 && stringData.length !== 0) {
                if (utils.search(stringData, this.pageSeparator) !== -1) {
                    this.socket.write(Buffer.from('20', 'hex'))
                }
                return
            }

            this.response = this.inputBuffer.split(this.irs)

            for (let i = 0; i < this.response.length; i++) {
                if (utils.search(this.response[i], this.pageSeparator) !== -1) {
                    this.response[i] = this.response[i].replace(this.pageSeparator, '')

                    if (this.response[i].length === 0) {this.response.splice(i, 1)}
                }
            }

            if (this.echoLines === 1) {this.response.shift()}
            else if (this.echoLines > 1) {this.response.splice(0, this.echoLines)}

            /* remove prompt */
            if (this.stripShellPrompt) {
                this.response.pop()
                /* add a blank line so that command output maintains the trailing new line */
                this.response.push('')
            }

            this.emit('responseready')
        }
    }

    _login(handle) {
        if ((handle === 'username' || handle === 'password') && this.socket.writable) {
            this.socket.write(this[handle] + this.ors, () => {
                this.state = 'getprompt'
            })
        }
    }

    _negotiate(chunk) {
        /* info: http://tools.ietf.org/html/rfc1143#section-7
         * refuse to start performing and ack the start of performance
         * DO -> WONT WILL -> DO */
        const packetLength = chunk.length

        let negData = chunk
        let cmdData = null
        let negResp = null

        for (let i = 0; i < packetLength; i += 3) {
            if (chunk[i] !== 255) { // Check
                negData = chunk.slice(0, i)
                cmdData = chunk.slice(i)
                break
            }
        }

        negResp = negData.toString('hex').replace(/fd/g, 'fc').replace(/fb/g, 'fd')

        if (this.socket.writable) {this.socket.write(Buffer.from(negResp, 'hex'))}

        if (cmdData !== undefined) {
            return cmdData
        } else {
            return
        }
    }

}

class Stream extends Duplex {
    constructor(source, options) {
        super(options)
        this.source = source

        this.source.on('data', (data) => this.push(data))
    }

    _write(data, encoding, cb) {
        if (!this.source.writable) {
            cb(new Error('socket not writable'))
        }

        this.source.write(data, encoding, () => {
            this.push(data)
            cb()
        })
    }

    _read() {}
}
