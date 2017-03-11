import { autoinject, bindable } from 'aurelia-framework';

// underscore-based debounce function
const debounce = (func: Function, wait: number, immediate?: boolean) => {
	let timeout;
	return function() {
		let context = this, args = arguments;
		let later = function() {
			timeout = null;
			if (!immediate) func.apply(context, args);
		};
		let callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		if (callNow) func.apply(context, args);
	};
};

@autoinject()
export class InViewCustomAttribute {

  scrollHandler: any;
  @bindable threshold: number = 0.2;

  constructor(private element: Element) {
    let documentScrollElement = document.scrollingElement || document.documentElement;
    this.scrollHandler = debounce(e => { this.checkView(); }, 250);
  }

  checkView() {
    let rect = this.element.getBoundingClientRect();
      let view = {
        height: (window.innerHeight || document.documentElement.clientHeight),
        width: (window.innerWidth || document.documentElement.clientWidth)
      }

      // TODO: add horizontal
      if ( rect.top <= view.height - (view.height * this.threshold) && rect.bottom >= 0 + (view.height * this.threshold) ) {
        this.element.classList.remove('out-of-view');
      } else {
        this.element.classList.add('out-of-view');
      }
  }

  attached() {
    document.addEventListener('scroll', this.scrollHandler);
    this.checkView();
  }

  thresholdChanged(newValue, oldValue) {
    console.log(newValue);
  }


}

