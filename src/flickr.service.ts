import { inject, NewInstance } from 'aurelia-framework';
import { EventAggregator } from 'aurelia-event-aggregator';
import { HttpService } from './http.service';
import * as process from './process.env';

const BASE_URL = process.env.FLICKR_BASE_URL;
const API_KEY = process.env.FLICKR_API_KEY;
const USER_ID = process.env.FLICKR_USER_ID;

export interface IFlickrPhoto {
  farm: number;
  id: string;
  isfamily: boolean;
  isprimary: boolean;
  ispublic: boolean;
  secret: string;
  server: string;
  title: string;
  url_m?: string;
  width_m?: number;
  height_m?: number;
  url_c?: string;
  width_c?: number;
  height_c?: number;
  url_l?: string;
  width_l?: number;
  height_l?: number;
  url_h?: string;
  width_h?: number;
  height_h?: number;
  url_o?: string;
  width_o?: number;
  height_o?: number;
  sizes?: IFlickrPhotoSize[]; // custom field
}

export interface IFlickrPhotoSize {
    width: number;
    height: number;
    label: string;
    media: string;
    source: string;
    url: string;
}

@inject(EventAggregator, NewInstance.of(HttpService))
export class FlickrService {
    photos: Array<IFlickrPhoto> = [];
    sizes: Array<any> = [];
    params: any;

    constructor(private ea: EventAggregator, private http: HttpService) {
        this.http.configure({ base_url: BASE_URL });
        this.params = {
                api_key: API_KEY,
                format: 'json',
                nojsoncallback: 'true',
                user_id: USER_ID
        }
    }

    getPublicPhotos(limit: number = 10, page: number = 1, extras: string = 'url_o'): Promise<Array<IFlickrPhoto>> {
        
        /*
        Extras is a comma-delimited list with the following possible values:
        description, license, date_upload, date_taken, owner_name, icon_server, original_format, last_update, geo, tags, 
        machine_tags, o_dims, views, media, path_alias, url_sq, url_t, url_s, url_q, url_m, url_n, url_z, url_c, url_l, url_o
        */
        extras = extras.indexOf('url_o') > -1 ? extras : extras+',url_o'; //ensure it always has this size
        let photos_id = [limit,page,extras].join('-');

        if (this.photos && this.photos.hasOwnProperty(photos_id)) { return new Promise( resolve => resolve(this.photos[photos_id])); }

        const photoParse = (data) => this.photos[photos_id] = JSON.parse(data.response).photos.photo;

        this.params.method = 'flickr.people.getPublicPhotos';
        this.params.per_page = limit;
        this.params.page = page;

        if(extras) { this.params.extras = extras; }

        return this.http.getData('/', this.params, photoParse);
    }

    getPhotoSizes(photo_id: string | number) {
        if (this.sizes && this.sizes.hasOwnProperty(photo_id) ) { return new Promise(resolve => resolve(this.sizes[photo_id])); }
        this.params.method = 'flickr.photos.getSizes';
        this.params.photo_id = photo_id;
        const sizesParse = (data) => this.sizes[photo_id] = JSON.parse(data.response).sizes.size.map( size => {
            return {
                height: ~~size.height,
                width: ~~size.width,
                label: size.label,
                media: size.media,
                source: size.source,
                url: size.url
            }
        });

        let params = Object.assign({}, this.params);
        return this.http.getData('/', params, sizesParse);
    }

    generateLink(photo: IFlickrPhoto, flickrSize: string): string {
        let imgUrlBase = `//farm${photo.farm}.static.flickr.com/${photo.server}/${photo.id}_${photo.secret}`;
        return `${imgUrlBase}_${flickrSize}.jpg`;
    }

}