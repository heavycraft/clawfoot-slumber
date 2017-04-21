import {Aurelia} from 'aurelia-framework'
import environment from './environment';

//Configure Bluebird Promises.
(<any>Promise).config({
  longStackTraces: environment.debug,
  warnings: {
    wForgottenReturn: false
  }
});

export function configure(aurelia: Aurelia) {
  aurelia.use
    .standardConfiguration()
    .plugin('aurelia-animator-css')
    .plugin('aurelia-google-analytics', config => {
      config.init('UA-33765324-5');
      config.attach({
        logging: { enabled: true },
        pageTracking: { enabled: true },
        clickTracking: { enabled: true }
      })
    })
    .feature('resources');

  if (environment.debug) {
    aurelia.use.developmentLogging();
  }

  if (environment.testing) {
    aurelia.use.plugin('aurelia-testing');
  }

  aurelia.start().then(() => aurelia.setRoot());
}
