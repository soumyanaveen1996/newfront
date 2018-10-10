import _ from 'lodash';
import RNFS from 'react-native-fs';
import config from '../../config/config.js';
import AssetFetcher from './AssetFetcher';
import { Auth, MessageTypeConstants, Promise, Network } from '../capability';
import SystemBot from '../../lib/bot/SystemBot';

class Bot {
    constructor(manifest, context) {
        this.manifest = manifest;
        this.context = context;

        if (!this.manifest.botUrl) {
            throw new Error('A bot requires valid bot url to load');
        }
        this.user;

        // Make sure root directory exists
        this.createRootDirectory();
    }

    /**
     * Return all the installed bots - based on the bots that are installed in the asset dir
     * @returns Array of manifests (that are basically the bot representation)
     */
    static async allInstalledBots() {
        console.log('>>>>>>>>>>>>>>Calling installedBots<<<<<<<<<<<<<<<<<<');

        let bots = [];
        const botsDir = `${AssetFetcher.RootDir}/${config.dce.botDirName}/`;
        let botsOnDevice = await AssetFetcher.readDir(botsDir);

        let slugPaths = await Promise.all(
            _.map(botsOnDevice, async botDir => {
                // Go down the slug path to get to the real manifest file path

                const pathToSlug = botDir.path;
                let pathContent = await AssetFetcher.readDir(pathToSlug);

                // Return the slug paths
                let allPaths = _.map(pathContent, slug => {
                    console.log(
                        '>>>>>>>>>INSTALLED BOTS<<<<<<<<<<<<<<<',
                        slug.path
                    );

                    return slug.path;
                });
                return allPaths;
            })
        ).catch(e => {
            console.log('Error reading bots on devices', e);
            return [];
        });

        // Need to flatten slugPaths (Some bots could have multiple versions!)
        slugPaths = _.flatten(slugPaths);

        // Finally iterate to read the manifest files and load them as bots
        bots = await Promise.all(
            _.map(slugPaths, async slugPath => {
                const manifestFile = `${slugPath}/${
                    config.dce.manifestFileName
                }`;
                let botManifest = await AssetFetcher.getFile(manifestFile);
                try {
                    return JSON.parse(botManifest);
                } catch (e) {
                    console.log(
                        "Bot:: installedBots:: Couldn't parse",
                        botManifest
                    );
                    return {};
                }
            })
        ).catch(e => {
            console.log('Error reading manifests on devices', e);
            return [];
        });
        return bots;
    }

    /**
     * Return the installed bots that are not system bots. But add the default bots to the list.
     * @returns Array of manifests (that are basically the bot representation)
     */
    static async installedBots() {
        let bots = await Bot.allInstalledBots();
        // System bots are to be hidden - hush!
        const systemBots = await Promise.resolve(SystemBot.getAllSystemBots());

        // Remove all the system bots from the list and only add default ones
        bots = _.filter(bots, o => {
            if (_.isEmpty(o)) {
                return false;
            }
            const sysBot = _.find(systemBots, ['botId', o.botId]);
            // Remove the IMBot - this is for people chat and cannot be part of regular bot
            if (sysBot) {
                return false;
            }
            return true;
        });
        const defaultBots = await Promise.resolve(SystemBot.getDefaultBots());
        bots = bots.concat(defaultBots);

        return bots;
    }

    async Load(ctx) {
        try {
            // Get the user as we need the creds
            this.user = await Promise.resolve(Auth.getUser());

            //first subscribe to the bot
            const options = {
                method: 'post',
                url:
                    config.proxy.protocol +
                    config.proxy.host +
                    config.proxy.subscribeToBot,
                data: {
                    botId: this.manifest.botId
                },
                headers: {
                    sessionId: this.user.creds.sessionId
                }
            };
            Network(options);

            this.createRootDirectory();

            await this.storeManifest();

            let remoteDeps = _.pickBy(this.manifest.dependencies, function(
                dep
            ) {
                return dep.remote === true || dep.remote === 'true';
            });
            //get dependecies
            await Promise.all(
                _.map(remoteDeps, async (dep, depName) => {
                    dep.name = depName;
                    let depResp = await AssetFetcher.loadDependency(
                        dep,
                        this.user
                    );

                    depResp = eval(depResp);
                    if (ctx) {
                        ctx.addCapability(depName, depResp);
                    }
                })
            ).catch(e => {
                console.log('Catching load err', e);
                throw e;
            });
            //get bot
            let botResp = await this.bot_data();
            botResp = eval(botResp);
            return botResp;
        } catch (e) {
            // TODO: handle errors
            console.log('Error occurred!:', e);
            this.Delete(ctx);
            throw e;
        }
    }

    /**
     * True: if the bot directory exists on device and is deleted
     * False: if the file doesn't exist on the device
     * Error: if something blew up
     * @param {*} ctx bot context
     */
    async Delete(ctx) {
        try {
            // Get the user as we need the creds
            this.user = await Promise.resolve(Auth.getUser());

            //first unsubscribe from the bot
            const options = {
                method: 'post',
                url:
                    config.proxy.protocol +
                    config.proxy.host +
                    config.proxy.unsubscribeFromBot,
                data: {
                    botId: this.manifest.botId
                },
                headers: {
                    sessionId: this.user.creds.sessionId
                }
            };
            Network(options);

            let botDirectoryPath = this.botDirectory;
            console.log(
                'Deleting the bot if it exists locally. botPath = ',
                botDirectoryPath
            );

            let existsOnDevice = await AssetFetcher.existsOnDevice(
                botDirectoryPath
            );

            // Did not find - just return
            if (!existsOnDevice) {
                console.log(
                    'Deleting the bot: Did not find the bot on the device'
                );
                return false;
            }
            await AssetFetcher.deleteFile(botDirectoryPath);

            //Delete dependencies?
            // TODO : To delete dependencies that are not in use

            /*
            let remoteDeps = _.pickBy(this.manifest.dependencies, function (dep) {
                return dep.remote === true;
            });
            await Promise.all(_.each(remoteDeps, async (dep, depName) => {
                await AssetFetcher.deleteDependency(depName, dep.version);
            })).catch((e) => {
                console.log('Catching delete dependency err', e);
                throw e;
            }); */

            return true;
        } catch (e) {
            // TODO: handle errors
            console.log('Error occurred!:', e);
            throw e;
        }
    }

    get context() {
        return this.context;
    }

    get name() {
        return this.manifest.botName;
    }

    get id() {
        return this.manifest.botId;
    }

    get botId() {
        return this.manifest.botId;
    }

    get slug() {
        return _.snakeCase(_.get(this.manifest, 'slug', this.manifest.botName));
    }

    async storeManifest() {
        // Store if required
        const manifest_file_path = `${this.assetFolder}/${
            config.dce.manifestFileName
        }`;
        const manifest_data = await AssetFetcher.existsOnDevice(
            manifest_file_path
        );

        if (!manifest_data) {
            try {
                await AssetFetcher.writeFile(
                    manifest_file_path,
                    JSON.stringify(this.manifest)
                );
            } catch (error) {
                // ignore saving for now
                console.log(
                    'Error occurred saving the manifest to directory!:',
                    error
                );
            }
        }
        return this.manifest;
    }

    async bot_data() {
        try {
            // Download or Get bot
            let bot_path = `${this.assetFolder}/${this.slug}.js`;
            let bot_data = await AssetFetcher.getFile(bot_path);

            let user = await Promise.resolve(Auth.getUser());

            if (!bot_data) {
                console.log(
                    'Bot::Did not find bot on the device. Downloading from the server: ',
                    this.manifest.botName
                );

                let res = await AssetFetcher.downloadBotFile(
                    bot_path,
                    this.manifest.botUrl,
                    user
                );
                bot_data = res;
            }
            return bot_data;
        } catch (error) {
            // TODO: handle errors
            console.log('Error occurred!:', error);
            throw error;
        }
    }

    get version() {
        return _.get(this.manifest, 'version', '0.0');
    }

    get botDirectory() {
        let slug = this.slug;
        return `${AssetFetcher.RootDir}/${config.dce.botDirName}/${slug}`;
    }

    get assetFolder() {
        let slug = this.slug;
        let version = this.version;

        let path = `${AssetFetcher.RootDir}/${
            config.dce.botDirName
        }/${slug}/${version}/`;

        return path;
    }

    async createRootDirectory() {
        let assetFolder = this.assetFolder,
            exists = await RNFS.exists(assetFolder);

        if (!exists) {
            console.log(this.slug, `${assetFolder} doesn't exist`);
            return await RNFS.mkdir(assetFolder);
        }
        console.log(this.slug, `${assetFolder}  exist`);

        return true;
    }

    async run() {
        console.log(this.slug, ' running context');
    }
}

export default Bot;
