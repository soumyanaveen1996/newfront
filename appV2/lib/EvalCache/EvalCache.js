class EvalCache {
    constructor() {
        this.evalCache = {};
    }
    eval(manifest, code) {
        const name = manifest.slug || manifest.name;
        const version = manifest.version;
        const key = `${name}-${version}`;
        if (!this.evalCache[key]) {
            var botModule = null;
            let botResp = null;
            botResp = eval(code);
            console.log('Eval::: botResp ' + key, botResp);
            console.log('Eval:::botModule ' + key, botModule);
            if (typeof botResp != 'object') botResp = botModule;
            this.evalCache[key] = botResp;
        }
        return this.evalCache[key];
    }
}

export default new EvalCache();
