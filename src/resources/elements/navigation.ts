import { bindable, inject } from 'aurelia-framework';
import { EventAggregator } from 'aurelia-event-aggregator';

@inject(Element, EventAggregator)
export class Navigation {
  @bindable items: any[];
  @bindable header: string;
  @bindable logo: string;
  @bindable social: any[];
  collapsed = true;
  scrollInterval;

  constructor(private el: Element, private ea: EventAggregator) {
    window.addEventListener('resize', this.collapse.bind(this));
    el.addEventListener('click', event => { event.stopPropagation(); } );
    document.getElementsByTagName('html')[0].addEventListener('click', this.collapse.bind(this));
    ea.subscribe('router:navigation:processing', () => { this.collapse(); });
  }

  toggleCollapse() {
    this.collapsed = this.collapsed ? false : true;
  }

  collapse() {
    console.log('collapsing');
    this.collapsed = true;
    return true;
  }

   scrollTo(anchor: string, duration = 1000) {
    clearInterval(this.scrollInterval);

    let scrollElement = document.scrollingElement || document.documentElement;
    let start = scrollElement.scrollTop;
    let to = document.getElementById(anchor.replace('#','')).offsetTop - 80;
    if (start === to) { return; }

    let diff = to - scrollElement.scrollTop;
    let step = Math.PI / (duration / 10);
    let count = 0, currPos = start;

    let easing = (t, b, c, d) =>  ((t /= d / 2) < 1) ? c / 2 * t * t * t * t * t + b : c / 2 * ((t -= 2) * t * t * t * t + 2) + b;
    this.scrollInterval = setInterval( () => {
      if (scrollElement.scrollTop !== to && currPos < scrollElement.scrollHeight) {
        currPos = easing( count * 10, start, diff, duration);
        count = count + 1;
        scrollElement.scrollTop = currPos;
      } else {
        clearInterval(this.scrollInterval);
      }
    }, 10);

    this.collapse();
  }

}
