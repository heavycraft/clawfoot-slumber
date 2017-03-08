import { inject, NewInstance } from 'aurelia-framework';
import { EventAggregator } from 'aurelia-event-aggregator';
import { HttpService } from './http.service';
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

@inject(EventAggregator, NewInstance.of(HttpService))
export class VimeoService {

    videos: Array<any>;
    params: any;

    constructor(private ea: EventAggregator, private http: HttpService) {
        this.configure();
    }

    configure(params?: any) {
        this.http.configure({
            base_url: `${BASE_URL}/users/${USER_ID}`,
            authorization: `Bearer ${ACCESS_TOKEN}`
        });
    }

    getPublicVideos(): Promise<Array<any>> {

        if (this.videos) { return new Promise( resolve => resolve(this.videos)); }

        const videosParse = (data) => JSON.parse(data.response).data;

        return this.http.getData('/videos', this.params, videosParse);
    }
}