
import { TelnetClient } from '../telnet';

console.log('Telnet client : ', TelnetClient);

export default class Telnet {
    constructor(observer) {
        this.client = new TelnetClient();
        this.observer = observer;
        this.commandsQueue = [];
        this.executingCommand = false;
        this.ready = false;
    }

    connect(options) {
        this.setupClient();
        this.options = options;
        this.client.connect(options);
    }

    setupClient() {
        this.client.on('connect', this.onConnect.bind(this));
        this.client.on('ready', this.onReady.bind(this));
    }

    onConnect() {

    }

    onReady() {
        this.ready = true;
        this.processCommandQueue();
        this.observer.clientReady();
    }

    async processCommandQueue() {
        if (this.executingCommand || !this.ready) {
            return;
        }
        if (this.commandsQueue.length === 0) {
            this.executingCommand = false;
            return;
        }
        console.log('Commands queue : ', this.commandsQueue);
        this.executingCommand = true;
        const command = this.commandsQueue.shift();
        if (command) {
            let res = await this.client.exec(command)
            this.observer.commandResult({
                command: command,
                result: res
            });
        }
        this.processCommandQueue();
    }

    exec(command) {
        this.commandsQueue.push(command);
        this.processCommandQueue();
    }

    close() {

    }
}
