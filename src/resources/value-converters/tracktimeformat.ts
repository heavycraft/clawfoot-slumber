import * as moment from 'moment';

export class TrackTimeFormatValueConverter {
  toView(value) {
    return moment(~~value).format('mm:ss');
    //return ~~value;
  }
}

