import { inject } from 'aurelia-framework';
import { FlickrService } from '../flickr.service';
import { VimeoService } from '../vimeo.service';

@inject(FlickrService, VimeoService)
export class Press {
    
    photos: any;
    videos: any;

    constructor(private flickr: FlickrService, private vimeo: VimeoService) {
        flickr.getPublicPhotos(10,1,'url_m').then(photos => { this.photos = photos});
        vimeo.getPublicVideos().then(videos => { this.videos = videos; console.log(videos); });
    }
}