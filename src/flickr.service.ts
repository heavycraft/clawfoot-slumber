import { inject } from 'aurelia-framework';
import { HttpClient } from 'aurelia-http-client';
import { EventAggregator } from 'aurelia-event-aggregator';
import * as process from './process.env';

const BASE_URL = process.env.FLICKR_BASE_URL;
const API_KEY = process.env.FLICKR_API_KEY;
const USER_ID = process.env.FLICKR_USER_ID;

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
export class FlickrService {
    httpClient = new HttpClient();
    loading: Array<any> = [];
    photos: Array<IFlickrPhoto>;
    params: any;

    constructor(private ea: EventAggregator) {
        this.configure();
    }

    configure(params?: any) {
        this.httpClient
            .configure(x => {
                x.withBaseUrl(`${BASE_URL}`);
            });
        this.params = {
                    api_key: API_KEY,
                    format: 'json',
                    nojsoncallback: 'true',
                    user_id: USER_ID
                }
    }

    getPublicPhotos(limit: number = 10, page: number = 1, extras?: string): Promise<Array<IFlickrPhoto>> {
        
        /*
        Extras is a comma-delimited list with the following possible values:
        description, license, date_upload, date_taken, owner_name, icon_server, original_format, last_update, geo, tags, 
        machine_tags, o_dims, views, media, path_alias, url_sq, url_t, url_s, url_q, url_m, url_n, url_z, url_c, url_l, url_o
        */

        if (this.photos) { return new Promise( resolve => resolve(this.photos)); }

        const photoParse = (data) => JSON.parse(data.response).photos.photo;

        this.params.method = 'flickr.people.getPublicPhotos';
        this.params.per_page = limit;
        this.params.page = page;

        if(extras) { this.params.extras = extras; }

        this.getData('/', this.params, photoParse);
    }

    generateLink(photo: IFlickrPhoto, flickrSize: string): string {
        let imgUrlBase = `//farm${photo.farm}.static.flickr.com/${photo.server}/${photo.id}_${photo.secret}`;
        return `${imgUrlBase}_${flickrSize}.jpg`;
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