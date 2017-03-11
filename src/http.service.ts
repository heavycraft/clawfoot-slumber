import { inject } from 'aurelia-framework';
import { HttpClient } from 'aurelia-http-client';
import { EventAggregator } from 'aurelia-event-aggregator';

@inject(EventAggregator)
export class HttpService {
    httpClient = new HttpClient();
    loading: Array<any> = [];

    constructor(private ea: EventAggregator) {}

    configure(params?: any) {
        this.httpClient.configure(x => { 
            x.withBaseUrl(`${params.base_url}`); 
            if(params.authorization) {
                x.withHeader( 'Authorization', params.authorization);
            }
        });
    }

    getData(endpoint: string, params?: any, parseFunction?: Function, errorsParseFunction?: Function) {
        this.loading.push(endpoint);
        this.ea.publish('http:loading', true);
        return new Promise((resolve, reject) => {
            this.httpClient
                .createRequest(endpoint)
                .asGet()
                .withParams(params)
                .withTimeout(3000)
                .send()
                .then(data => {
                    this.loading.splice(this.loading.indexOf(endpoint), 1);
                    this.ea.publish('http:loading', this.loading.length);
                    resolve( parseFunction ? parseFunction(data) : JSON.parse(data.response));
                })
                .catch(e => {
                    this.loading.splice(this.loading.indexOf(endpoint), 1);
                    this.ea.publish('http:loading', this.loading.length);
                    reject( errorsParseFunction ? errorsParseFunction(e) : e);
                });
        });
    }
}