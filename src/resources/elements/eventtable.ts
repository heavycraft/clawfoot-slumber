import {bindable} from 'aurelia-framework';

export class EventTable {
  @bindable title;
  @bindable events;

  openUrl(url: string){
    window.location.assign(url);
  }
}

