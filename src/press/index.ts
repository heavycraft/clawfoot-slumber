import { inject } from 'aurelia-framework';
import { FlickrService } from '../flickr.service';

@inject(FlickrService)
export class Press {
    
    constructor(private flickr: FlickrService) {
        flickr.getPublicPhotos();
    }
}