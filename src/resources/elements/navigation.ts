import { bindable, inject } from 'aurelia-framework';
import { EventAggregator } from 'aurelia-event-aggregator';

@inject(Element, EventAggregator)
export class Navigation {
  @bindable items: any[];
  @bindable header: string;
  @bindable logo: string;
  @bindable social: any[];
  @bindable router: any;
  collapsed = true;
  scrollInterval;
  nextLink: any;

  constructor(private el: Element, private ea: EventAggregator) {
    window.addEventListener('resize', this.collapse.bind(this));
    el.addEventListener('click', event => { event.stopPropagation(); });
    document.getElementsByTagName('html')[0].addEventListener('click', this.collapse.bind(this));
    ea.subscribe('router:navigation:processing', () => { this.collapse(); });
    ea.subscribe('router:navigation:complete', () => {
      if(this.nextLink && this.nextLink.anchor) {
        this.scrollTo(this.nextLink.anchor);
      }
    })
  }

  toggleCollapse() {
    this.collapsed = this.collapsed ? false : true;
  }

  collapse() {
    this.collapsed = true;
    return true;
  }

  navigateTo(link: any, duration = 1000) {

    this.router.navigateToRoute(link.route);
    this.nextLink = link;
    this.scrollTo(link.anchor);
  }

  scrollTo(anchor: string, duration = 1000) {
    if (anchor && document.getElementById(anchor.replace('#', ''))) {
        clearInterval(this.scrollInterval);

        let scrollElement = document.scrollingElement || document.documentElement;
        let scrollAnchorElement = document.getElementById(anchor.replace('#', ''));
        let start = scrollElement.scrollTop;
        let to = scrollAnchorElement.offsetTop - 80 > 0 ? scrollAnchorElement.offsetTop - 80 : 0;
        if (start === to) { return; }

        let diff = to - scrollElement.scrollTop;
        let step = Math.PI / (duration / 10);
        let count = 0, currPos = start;

        let easing = (t, b, c, d) => ((t /= d / 2) < 1) ? c / 2 * t * t * t * t * t + b : c / 2 * ((t -= 2) * t * t * t * t + 2) + b;
        this.scrollInterval = setInterval(() => {
          if (scrollElement.scrollTop !== to && currPos < scrollElement.scrollHeight) {
            currPos = easing(count * 10, start, diff, duration);
            count = count + 1;
            scrollElement.scrollTop = currPos;
          } else {
            clearInterval(this.scrollInterval);
          }
        }, 10);

        this.collapse();
      }
  }

}
