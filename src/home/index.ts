import { inject } from 'aurelia-framework';
import { BandsintownService } from '../bandsintown.service';
import { SoundCloudService, ISoundCloudUser, ISoundCloudPlaylist } from '../soundcloud.service';
import { VimeoService, IVimeoVideo } from '../vimeo.service';

@inject(BandsintownService, SoundCloudService, VimeoService)
export class Home {

    band: ISoundCloudUser;
    album: ISoundCloudPlaylist;
    video: IVimeoVideo;
    events = { past: [], future: [] };
    
    constructor(private bandsintown: BandsintownService, private soundcloud: SoundCloudService, private vimeo: VimeoService) {
        bandsintown.configure({ artistname: 'ClawfootSlumber', app_id: 'CLAWFOOT_SLUMBER' });
        bandsintown.getEvents('past', 5).then(events => this.events.past = events);
        bandsintown.getEvents('upcoming').then(events => this.events.future = events);
        soundcloud.getUser('clawfootslumber').then(band => this.band = band);
        soundcloud.getUserPlaylists('clawfootslumber').then(playlists => this.album = playlists[0]);
        vimeo.getPublicVideos().then(videos => this.video = videos[0]);
    }
}