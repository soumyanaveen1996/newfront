import axios from 'axios';
import configToUse from '../config/config';
import { Auth } from '../lib/capability';
import EventEmitter from '../lib/events';
import { logToFile } from '../lib/utils/Logging';
import Store from '../redux/store/configureStore';
import { getBaseParams } from './BaseParams';
import Bugsnag from '@bugsnag/react-native';
const baseURL = configToUse.grpcURL;
let controller;
const logAPIs = false; //use this to enable disbale logging of API calls

const createAxiosInstance = () => {
    controller = new AbortController();
    const axiosInstance = axios.create({
        baseURL: baseURL,
        signal: controller.signal,
        timeout: 20000,
        headers: { 'Content-Type': 'application/json' }
    });

    axiosInstance.interceptors.response.use(
        (response) => {
            parseResponse(response.data);
            if (logAPIs)
                console.log(
                    `%c axios response interceptor <----`,
                    'color: green',
                    response?.config?.url,
                    response?.data
                );
            return response.data;
        },
        (error) => {
            if (logAPIs)
                console.log(
                    `%c axios response interceptors <----`,
                    'color: red',
                    error?.config?.url,
                    error
                );
            if (
                error?.response?.data?.code === 16 &&
                error?.response?.data?.details === 'UNAUTHORIZED'
            ) {
                console.log('API error 16 :: ', JSON.stringify(error));
                Auth.isUserLoggedIn().then((isLoggedIn) => {
                    if (isLoggedIn) {
                        logToFile('API error 16 in ' + error?.config?.url);
                        EventEmitter.emit('sessionExpired');
                        controller.abort();
                        console.log('axios aborting');
                    } else {
                        console.log(
                            'axios response auth error, no user logged in'
                        );
                    }
                });
            } else {
                return Promise.reject(error);
            }
        }
    );
    axiosInstance.interceptors.request.use((config) => {
        if (Store.getState()?.session?.user?.creds?.sessionId) {
            config.headers.sessionId =
                Store.getState().session?.user?.creds?.sessionId;
        }
        config.data = { ...getBaseParams(), ...config.data };
        if (logAPIs)
            console.log(
                `%c axios request interceptor data ---->`,
                'color: yellow',
                config.url,
                config.data
            );
        return config;
    });
    return axiosInstance;
};

let apiClientInstance = createAxiosInstance();

const parseResponse = (response) => {
    for (var key in response) {
        if (response[key] instanceof Object) {
            if (response[key].type === 'Buffer' && response[key].data) {
                try {
                    response[key] = JSON.parse(
                        Buffer.from(response[key].data, 'base64')
                    );
                } catch (e) {
                    response[key] = {};
                }
            } else {
                parseResponse(response[key]);
            }
        }
    }
};

const abortaxios = () => {
    console.log('axios aborting api client');
    controller.abort();
};

const resetApiClient = () => {
    console.log('axios resetting api client');
    apiClientInstance = createAxiosInstance();
};

const apiClient = () => apiClientInstance;

export default apiClient;
export { resetApiClient, abortaxios };
