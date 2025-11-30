import Constants from 'expo-constants';

const port = process.env.PORT || 3000;

const getApiUrl = () => {
    const debuggerHost = Constants.expoConfig?.hostUri;
    if (debuggerHost) {
        const host = debuggerHost.split(':')[0]
        return `http://${host}:${port}/api`;
    }

    return `http://localhost:${port}/api`;
};

const API_URL = getApiUrl();

export default API_URL;
