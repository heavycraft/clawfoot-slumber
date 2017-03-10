import { inject } from 'aurelia-framework';
import { BandsintownService } from '../bandsintown.service';
import { SoundCloudService, ISoundCloudUser } from '../soundcloud.service';

@inject(BandsintownService, SoundCloudService)
export class Home {

    band: ISoundCloudUser;
    events = { past: [], future: [] };
    
    constructor(private bandsintown: BandsintownService, private soundcloud: SoundCloudService) {
        bandsintown.configure({ artistname: 'ClawfootSlumber', app_id: 'CLAWFOOT_SLUMBER' });
        bandsintown.getEvents('past', 5).then(events => this.events.past = events);
        bandsintown.getEvents('upcoming').then(events => this.events.future = events);
        soundcloud.getUser('clawfootslumber').then(band => this.band = band);
    }
}