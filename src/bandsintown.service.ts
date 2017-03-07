import { inject } from 'aurelia-framework';
import { HttpClient } from 'aurelia-http-client';
import { EventAggregator } from 'aurelia-event-aggregator';
import * as moment from 'moment';

const BASE_URL = 'https://rest.bandsintown.com/artists/';

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

@inject(EventAggregator)
export class BandsintownService {
    httpClient = new HttpClient();
    loading: Array<any> = [];
    events: IEvent[];
    app_id: string;

    constructor(private ea: EventAggregator) { }

    configure(params: any) {
        this.app_id = params.app_id;
        this.httpClient
            .configure(x => {
                x.withBaseUrl(`${BASE_URL}/${params.artistname}`);
            });
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

        const eventParse = (data) => JSON.parse(data.response)
            .reverse()
            .filter((arr, idx) => limit ? idx < limit : true)
            .map( (event: IEvent) => {
                event.lineup = event.lineup.filter( band => band.toLowerCase() !== 'clawfoot slumber');
                return event;
            });

        return this.getData('events', {date: datestr, app_id: this.app_id}, eventParse);
    }

    private getData(endpoint: string, params?: any, parseFunction?: Function) {
        this.loading.push(endpoint);
        this.ea.publish('http:loading', true);
        return new Promise((resolve, reject) => {
            this.httpClient
                .createRequest(endpoint)
                .asGet()
                .withParams(params)
                .send()
                .then(data => {
                    this.loading.splice(this.loading.indexOf(endpoint), 1);
                    this.ea.publish('http:loading', this.loading.length);
                    resolve( parseFunction ? parseFunction(data) : JSON.parse(data.response));
                })
                .catch(e => {
                    this.loading.splice(this.loading.indexOf(endpoint), 1);
                    this.ea.publish('http:loading', this.loading.length);
                    reject(e);
                });
        });
    }
}