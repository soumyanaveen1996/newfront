
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
        //this.setupClient();
        this.options = options;
        return new Promise((resolve) => {
            this.client.connect(options);
            this.client.on('ready', () => {
                resolve();
                this.onReady();
            });
        });
    }

    onReady() {
        this.ready = true;
        this.processCommandQueue();
    }

    async processCommandQueue() {
        if (this.commandsQueue.length === 0) {
            this.executingCommand = false;
            return;
        }
        if (this.executingCommand || !this.ready) {
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
        this.client.destroy();
    }
}
