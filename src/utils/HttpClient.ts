/*
 * Copyright (c) 2020 Certis CISCO Security Pte Ltd
 * All rights reserved.
 *
 * This software is the confidential and proprietary information of
 * Certis CISCO Security Pte Ltd. ("Confidential Information").
 * You shall not disclose such Confidential Information and shall use
 * it only in accordance with the terms of the license agreement you
 * entered into with Certis CISCO Security Pte Ltd.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';


/**
 * Performs HTTP requests. API similar to Angular HttpClient
 *
 * @author Lingqi
 */
export const HttpClient = {

    get<T>(url: string, options?: {
        params?: { [param: string]: string },
        headers?: { [header: string]: string },
        withCredentials?: boolean,
    }): Promise<T> {
        return request<T>('GET', url, options);
    },

    post<T>(url: string, options?: {
        body?: { [key: string]: any },
        headers?: { [header: string]: string },
        withCredentials?: boolean,
    }): Promise<T> {
        return request<T>('POST', url, options);
    },

};

function request<T>(method: string, url: string, options: {
    params?: { [param: string]: string },
    body?: { [key: string]: any },
    headers?: { [header: string]: string },
    withCredentials?: boolean,
} = {}): Promise<T> {
    return new Promise((resolve, reject) => {
        if (options.params) {
            url = url + encodeParams(options.params);
        }
        const headers = options.headers || {};
        headers['Content-Type'] = 'application/json';
        headers['Accept'] = 'application/json';
        const fetchOptions: RequestInit = {
            method,
            headers,
            body: options.body ? JSON.stringify(options.body) : undefined,
            credentials: options.withCredentials ? 'include' : 'omit'
        };
        fetch(url, fetchOptions).then((response) => {
            response.json().then((json) => {
                if (response.ok) {
                    resolve(json);
                } else {
                    reject(json.error);
                }
            });
        }).catch((reason: Error) => {
            reject(reason.message);
        });
    });
}

function encodeParams(params: { [param: string]: string }): string {
    const paramString = Object.keys(params)
        .map((key) => {
            const eKey = encodeURIComponent(key);
            const eValue = encodeURIComponent(params[key]);
            return eKey + '=' + eValue;
        }).join('&');
    return '?' + paramString;
}
