import { inject, NewInstance } from 'aurelia-framework';
import { EventAggregator } from 'aurelia-event-aggregator';
import { HttpService } from './http.service';
import * as moment from 'moment';
import * as process from './process.env';

const BASE_URL = process.env.BANDSINTOWN_BASE_URL;
const APP_ID = process.env.BANDSINTOWN_APP_ID;

interface IVenue {
    name: string;
    latitude: string | number;
    longitude: string | number;
    city: string;
    region: string;
    country: string;
}

interface IEvent {
    id: string | number;
    artist_id: string | number;
    url: string;
    datetime: string;
    venue: IVenue;
    offers: any[];
    lineup: string[];
}

@inject(EventAggregator, NewInstance.of(HttpService))
export class BandsintownService {
    events: IEvent[] = [];

    constructor(private ea: EventAggregator, private http: HttpService) { }

    configure(params: any) {
        this.http.configure({base_url: `${BASE_URL}/${params.artistname}`});
    }

    getEvents(date: 'upcoming' | 'past' = 'upcoming', limit?: number): Promise<IEvent[]> {
        if (this.events && this.events.hasOwnProperty(date)) { return new Promise( resolve => resolve(this.events[date])); }

        let datestr;

        if ( date === 'past' ) {
            let start = new Date();
            start.setDate(start.getDate() - 1);
            datestr = `${(start.getFullYear()-1)}-01-01,${moment(start).format('YYYY-MM-DD')}`;
        } else {
            datestr = date;
        }

        const eventParse = (data) => this.events[date] = JSON.parse(data.response)
            .reverse()
            .filter((arr, idx) => limit ? idx < limit : true)
            .map( (event: IEvent) => {
                event.lineup = event.lineup.filter( band => band.toLowerCase() !== 'clawfoot slumber');
                return event;
            });

        return this.http.getData('events', {date: datestr, app_id: APP_ID}, eventParse);
    }

}