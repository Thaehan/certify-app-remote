/*
 * Copyright (c) 2019 Certis CISCO Security Pte Ltd
 * All rights reserved.
 *
 * This software is the confidential and proprietary information of
 * Certis CISCO Security Pte Ltd. ("Confidential Information").
 * You shall not disclose such Confidential Information and shall use
 * it only in accordance with the terms of the license agreement you
 * entered into with Certis CISCO Security Pte Ltd.
 */
import URI from "urijs";
import Base64 from "base64-js";
import { Crypto, RsaKey, SigParams } from "../nativeUtils/Crypto";
import { HttpClient } from "../utils/HttpClient";
import { toErrorMessage } from "../utils/I18n";
import { Environment } from "../utils/Environment";
import { RootStore } from "./RootStore";
import { MobileApp } from "./AppListStore";

// tslint:disable-next-line: interface-over-type-literal
type Query = { [key: string]: string };

/**
 * Service handle inbound and outbound link of the app
 *
 * @author Lingqi
 */
export class CallbackStore {
    private rootStore: RootStore;

    private readonly KEY_SIZE = 128;
    private publicKey!: RsaKey;
    selectedApp!: MobileApp;
    sessionId!: string;
    appName!: string;
    appId!: string;

    constructor(rootStore: RootStore) {
        this.rootStore = rootStore;
        (URI as any).escapeQuerySpace = false;
    }

    handleInboundLink(data: string, sign: string): Promise<Query> {
        return new Promise((resolve, reject) => {
            let inboundQuery: Query;
            const secretKeyBytes = this.encode(
                sign.substring(0, this.KEY_SIZE / 8)
            );
            const ivBytes = new Uint8Array(16);
            const dataBytes = Base64.toByteArray(data);
            Crypto.AES.decrypt("CBC", ivBytes, secretKeyBytes, dataBytes)
                .then((queryBytes) => {
                    const query = URI.parseQuery(
                        "?" + this.decode(queryBytes)
                    ) as Query;
                    inboundQuery = query;
                    const queryString = Object.keys(query)
                        .sort()
                        .reduce((accumulator, queryKey) => {
                            return accumulator + queryKey + query[queryKey];
                        }, "");
                    const verifyBytes = this.encode(queryString);
                    const signature = Base64.toByteArray(sign);
                    const sigParams: SigParams = {
                        scheme: "PKCS1-v1_5",
                        hash: "SHA-256",
                    };
                    if (this.publicKey) {
                        return Crypto.RSA.verify(
                            sigParams,
                            this.publicKey,
                            verifyBytes,
                            signature
                        );
                    } else {
                        const keyBytes = this.pemToBinary(
                            Environment.publicKey
                        );
                        return Crypto.RSA.importKey("spki", keyBytes).then(
                            (publicKey) => {
                                this.publicKey = publicKey;
                                return Crypto.RSA.verify(
                                    sigParams,
                                    this.publicKey,
                                    verifyBytes,
                                    signature
                                );
                            }
                        );
                    }
                })
                .then((verified) => {
                    if (verified) {
                        this.sessionId = inboundQuery["si"];
                        this.appId = inboundQuery["ai"];
                        this.appName = inboundQuery["app"];
                        resolve(inboundQuery);
                    } else {
                        this.sessionId = "fake";
                        reject("not verified");
                    }
                })
                .catch((error: Error) => {
                    reject(error.message);
                });
        });
    }

    getOutboundLink(): Promise<string> {
        return new Promise((resolve, reject) => {
            const sessionStore = this.rootStore.cognitoSessionStore;
            if (!this.sessionId || !sessionStore.currentSession) {
                reject("There is no callback session");
                return;
            }
            const url = Environment.endPoint + "/callback";
            const body = {
                si: this.sessionId,
                token: sessionStore.currentSession.getIdToken().getJwtToken(),
            };
            HttpClient.post<CallbackResponse>(url, {
                body,
                withCredentials: true,
            })
                .then((response) => {
                    // const query = URI.buildQuery({
                    //     action: 'auth',
                    //     code: response.code,
                    //     state: response.state,
                    // });
                    // const redirectUrl = response.redirect_uri + '?' + query;
                    const redirectUrl = new URI(response.redirect_uri);
                    redirectUrl.addSearch("action", "auth");
                    redirectUrl.addSearch("code", response.code);
                    redirectUrl.addSearch("state", response.state);
                    resolve(redirectUrl.href());
                })
                .catch((reason) => {
                    reject(toErrorMessage(reason));
                });
        });
    }

    getAppStartLink(): string {
        if (!this.selectedApp) {
            return "";
        }
        // const query = URI.buildQuery({
        //     action: 'start'
        // });
        // return this.selectedApp.redirectUri + '?' + query;
        const uri = new URI(this.selectedApp.redirectUri);
        uri.addSearch("action", "start");
        return uri.href();
    }

    clearCallback(): void {
        this.selectedApp = null!;
        this.sessionId = "";
        this.appName = "";
        this.appId = "";
    }

    private encode(str: string): Uint8Array {
        const bufferView = new Uint8Array(str.length);
        for (let i = 0; i < str.length; i++) {
            bufferView[i] = str.charCodeAt(i);
        }
        return bufferView;
    }

    private decode(bufferView: Uint8Array): string {
        const codes = bufferView as any;
        return String.fromCharCode.apply(null, codes);
    }

    private pemToBinary(pem: string): Uint8Array {
        const lines = pem.split("\n");
        let pemContents = "";
        for (let i = 1; i < lines.length - 1; i++) {
            pemContents += lines[i].trim();
        }
        return Base64.toByteArray(pemContents);
    }
}

interface CallbackResponse {
    redirect_uri: string;
    code: string;
    state: string;
}
