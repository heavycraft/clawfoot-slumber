import { inject } from 'aurelia-framework';
import { HttpClient } from 'aurelia-http-client';
import { EventAggregator } from 'aurelia-event-aggregator';
import * as process from './process.env';

const BASE_URL = process.env.VIMEO_BASE_URL;
const USER_ID = process.env.VIMEO_USER_ID;
const ACCESS_TOKEN = process.env.VIMEO_ACCESS_TOKEN;

interface IFlickrPhoto {
  farm: number;
  id: string;
  isfamily: boolean;
  isprimary: boolean;
  ispublic: boolean;
  secret: string;
  server: string;
  title: string;
}

@inject(EventAggregator)
export class VimeoService {
    httpClient = new HttpClient();
    loading: Array<any> = [];
    videos: Array<any>;
    params: any;

    constructor(private ea: EventAggregator) {
        this.configure();
    }

    configure(params?: any) {
        this.httpClient
            .configure(x => {
                x.withBaseUrl(`${BASE_URL}/users/${USER_ID}`);
                x.withHeader( 'Authorization', `Bearer ${ACCESS_TOKEN}`);
            });
    }

    getPublicVideos(): Promise<Array<any>> {

        if (this.videos) { return new Promise( resolve => resolve(this.videos)); }

        const videosParse = (data) => JSON.parse(data.response).data;

        return this.getData('/videos', this.params, videosParse);
    }

    private getData(endpoint: string, params?: any, parseFunction?: Function) {
        this.loading.push(endpoint);
        this.ea.publish('http:loading', true);
        return new Promise((resolve, reject) => {
            this.httpClient
                .createRequest(endpoint)
                .asGet()
                .withParams(params)
                .send()
                .then(data => {
                    this.loading.splice(this.loading.indexOf(endpoint), 1);
                    this.ea.publish('http:loading', this.loading.length);
                    resolve( parseFunction ? parseFunction(data) : JSON.parse(data.response));
                })
                .catch(e => {
                    this.loading.splice(this.loading.indexOf(endpoint), 1);
                    this.ea.publish('http:loading', this.loading.length);
                    reject(e);
                });
        });
    }
}