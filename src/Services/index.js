import axios from 'axios';
import { HTTPVERBS } from '../utils/HTTPVERBS';

export const apiHelper = async (method, endPoints, customHeaders, body) => {
    const baseUrl = "https://server1.appsstaging.com/3854/hunt_and_hull/public/api/";
    
    const headers = {
        'Content-Type': 'application/json',
        ...customHeaders, 
    };
    const config = {
        url: `${baseUrl}${endPoints}`,
        method: method,
        headers: headers,
        ...(method !== HTTPVERBS.GET && { data: body }), 
    };
    try {
        const res = await axios(config);
        return {
            error: null,
            response: res,
        };
    } 
    catch (error) {
        console.error("API Error:", error.response?.data || error.message); 
        return {
            error: error.response?.data || error.message,
            response: null,
        };
    }
};

