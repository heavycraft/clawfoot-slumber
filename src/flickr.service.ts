import { inject, NewInstance } from 'aurelia-framework';
import { EventAggregator } from 'aurelia-event-aggregator';
import { HttpService } from './http.service';
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

@inject(EventAggregator, NewInstance.of(HttpService))
export class FlickrService {
    photos: Array<IFlickrPhoto>;
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

        return this.http.getData('/', this.params, photoParse);
    }

    generateLink(photo: IFlickrPhoto, flickrSize: string): string {
        let imgUrlBase = `//farm${photo.farm}.static.flickr.com/${photo.server}/${photo.id}_${photo.secret}`;
        return `${imgUrlBase}_${flickrSize}.jpg`;
    }

}