import { inject } from 'aurelia-framework';
import { FlickrService } from '../flickr.service';
import { VimeoService } from '../vimeo.service';
import { SoundCloudService, ISoundCloudPlaylist } from '../soundcloud.service';
import * as process from '../process.env';

@inject(FlickrService, VimeoService, SoundCloudService)
export class Press {
    band: any;
    photos: any;
    videos: any;
    playlists: ISoundCloudPlaylist[];
    flickrId = process.env.FLICKR_USER_ID;
    errors: any = {};

    constructor(private flickr: FlickrService, private vimeo: VimeoService, private soundcloud: SoundCloudService) {
        flickr.getPublicPhotos(10,1,'url_m').then(photos => { this.photos = photos; });
        vimeo.getPublicVideos(['uri', 'name'])
            .then(videos => { this.videos = videos; })
            .catch(error => this.errors.video = error);
        soundcloud.getUser('clawfootslumber').then(band => { this.band = band; });
        soundcloud.getUserPlaylists('clawfootslumber').then(playlists => { 
            this.playlists = playlists;
        });
    }

    
}