import { inject } from 'aurelia-framework';
import { RouterConfiguration, Router } from 'aurelia-router';
import { FlickrService } from './flickr.service';

@inject(FlickrService)
export class App {

  router: Router;

  navItems = [
    { title: 'music',     route: 'home',   anchor: 'music',    active: false },
    { title: 'video',     route: 'home',   anchor: 'video',    active: false },
    { title: 'about',     route: 'home',   anchor: 'about',    active: false },
    { title: 'tour',      route: 'home',   anchor: 'tour',     active: false },
    { title: 'contact',   route: 'home',   anchor: 'contact',  active: false },
    { title: 'press kit', route: 'press',  anchor: false,      active: false, highlight: true}
  ];

  social = [
    { title: 'Facebook', link: 'https://www.facebook.com/clawfootslumber', icon: 'fa-facebook' },
    { title: 'Instagram', link: 'http://instagram.com/clawfoot_slumber', icon: 'fa-instagram' },
    { title: 'Vimeo', link: 'http://vimeo.com/user6572631', icon: 'fa-vimeo' },
    { title: 'iTunes', link: 'https://itunes.apple.com/us/artist/clawfoot-slumber/id441755859', icon: 'fa-apple' },
    { title: 'Spotify', link: 'https://play.spotify.com/artist/5Hm3XSRX8PRpKaxVMh0Qys', icon: 'fa-spotify' }
  ];

  constructor(private flickr: FlickrService) {
    flickr.getPublicPhotos(10,1,'url_l');
  }

  configureRouter(config: RouterConfiguration, router: Router) {
    this.router = router;
    config.title = 'Clawfoot Slumber';
    config.addPipelineStep('postcomplete', PostCompleteStep);
    config.map([
      { route: ['', 'home'],          name: 'home',           moduleId: 'home/index',      nav: true,     title: 'Home' },
      { route: 'press',               name: 'press',          moduleId: 'press/index',     nav: true,     title: 'Press Kit' },
    ]);
  }

}

class PostCompleteStep {
  run(routingContext, next) {
    window.scrollTo(0, 0);
    return next();
  }
}
