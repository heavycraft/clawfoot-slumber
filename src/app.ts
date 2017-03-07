import { inject } from 'aurelia-framework';
import { BandsintownService } from './bandsintown.service';

@inject(BandsintownService)
export class App {

  navItems = [
    { title: 'music', href: '#music', active: false },
    { title: 'video', href: '#video', active: false },
    { title: 'about', href: '#about', active: false },
    { title: 'tour', href: '#tour', active: false },
    { title: 'contact', href: '#contact', active: false },
  ];

  social = [
    { title: 'Facebook', link: 'https://www.facebook.com/clawfootslumber', icon: 'fa-facebook' },
    { title: 'Instagram', link: 'http://instagram.com/clawfoot_slumber', icon: 'fa-instagram' },
    { title: 'Vimeo', link: 'http://vimeo.com/user6572631', icon: 'fa-vimeo' },
    { title: 'iTunes', link: 'https://itunes.apple.com/us/artist/clawfoot-slumber/id441755859', icon: 'fa-apple' },
    { title: 'Spotify', link: 'https://play.spotify.com/artist/5Hm3XSRX8PRpKaxVMh0Qys', icon: 'fa-spotify' }
  ];

  events = { past: [], future: []};

  constructor(private bandsintown: BandsintownService) {
    bandsintown.configure({artistname: 'ClawfootSlumber', app_id: 'CLAWFOOT_SLUMBER'});
    bandsintown.getEvents('past', 5).then( events => this.events.past = events);
    bandsintown.getEvents('upcoming').then( events => this.events.future = events);
  }

}
