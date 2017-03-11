import { inject, NewInstance } from 'aurelia-framework';
import { EventAggregator } from 'aurelia-event-aggregator';
import { HttpService } from './http.service';
import * as process from './process.env';

const BASE_URL = process.env.VIMEO_BASE_URL;
const USER_ID = process.env.VIMEO_USER_ID;
const ACCESS_TOKEN = process.env.VIMEO_ACCESS_TOKEN;

export interface IVimeoPicture {
    width: number;
    height: number;
    link: string;
    link_with_play_button: string;
}

export interface IVimeoWebsite {
    description?: string;
    link: string;
    name?: string;
}

export interface IVimeoUser {
    account: string;
    bio: string;
    created_time: string;
    link: string;
    location: string;
    medatadata: any;
    name: string;
    pictures: IVimeoPictures;
    preferences?: any;
    resource_key: string;
    uri: string;
    websites: Array<IVimeoWebsite>;
}

export interface IVimeoPictures {
    active: string, 
    resource_key: string, 
    type: string, 
    uri: string, 
    sizes: Array<IVimeoPicture>
}

export interface IVimeoVideo {
  created_time: string;
  modified_time: string;
  release_time: string;
  name: string;
  description: string;
  duration: number;
  embed: { html: string };
  height: number;
  width: number;
  link: string;
  metadata: any;
  pictures: IVimeoPictures;
  privacy?: {
      add?: boolean, 
      comments?: 'anybody' | 'nobody' | 'contacts', 
      download?: boolean, 
      embed?: 'public', 'private', 'whitelist',
      view?: 'anybody' | 'nobody' | 'contacts' | 'password' | 'users' | 'unlisted' | 'disable'
    };
  resource_key: string;
  stats: { plays: number };
  status: string;
  tags: Array<any>;
  uri: string;
  user: any;
  app?: any;
  content_rating?: Array<any>; // see /contentrating endpoint
  embed_presets?: any;
  language?: any;
  license?: 'by' | 'by-sa' | 'by-nd' | 'by-nc' | 'by-nc-sa' | 'by-nc-nd' | 'cc0';
}

@inject(EventAggregator, NewInstance.of(HttpService))
export class VimeoService {

    videos: Array<IVimeoVideo> = [];
    params: any = {};

    constructor(private ea: EventAggregator, private http: HttpService) {
        this.configure();
    }

    configure(params?: any) {
        this.http.configure({
            base_url: `${BASE_URL}/users/${USER_ID}`,
            authorization: `Bearer ${ACCESS_TOKEN}`
        });
    }

    getPublicVideos(fields?: string[]): Promise<Array<IVimeoVideo>> {
        let videos_id = 'videos-'+fields.join('-');
        if (this.videos && this.videos.hasOwnProperty(videos_id)) { return new Promise( resolve => resolve(this.videos[videos_id])); }
        if(fields && fields.length) { this.params.fields = fields.join(','); }

        const videosParse = (data) => this.videos[videos_id] = JSON.parse(data.response).data;
        const errorsParse = (data) => JSON.parse(data.response).error;

        return this.http.getData('/videos', this.params, videosParse, errorsParse);
    }
}