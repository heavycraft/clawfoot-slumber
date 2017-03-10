import { inject } from 'aurelia-framework';
import { FlickrService } from '../flickr.service';
import { VimeoService } from '../vimeo.service';
import { SoundCloudService, ISoundCloudPlaylist } from '../soundcloud.service';


@inject(FlickrService, VimeoService, SoundCloudService)
export class Press {
    band: any;
    photos: any;
    videos: any;
    playlist: ISoundCloudPlaylist;

    constructor(private flickr: FlickrService, private vimeo: VimeoService, private soundcloud: SoundCloudService) {
        flickr.getPublicPhotos(10,1,'url_m').then(photos => { this.photos = photos; });
        vimeo.getPublicVideos().then(videos => { this.videos = videos; });
        soundcloud.getUser('clawfootslumber').then(band => { this.band = band; });
        soundcloud.getUserPlaylists('clawfootslumber').then(playlists => { 
            if(playlists.length && playlists[0].tracks.length) {
                this.playlist = playlists[0];
            }
        });
    }

    
}