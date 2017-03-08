import { inject } from 'aurelia-framework';
import { BandsintownService } from '../bandsintown.service';

@inject(BandsintownService)
export class Home {

    events = { past: [], future: [] };
    
    constructor(private bandsintown: BandsintownService) {
        bandsintown.configure({ artistname: 'ClawfootSlumber', app_id: 'CLAWFOOT_SLUMBER' });
        bandsintown.getEvents('past', 5).then(events => this.events.past = events);
        bandsintown.getEvents('upcoming').then(events => this.events.future = events);
    }
}