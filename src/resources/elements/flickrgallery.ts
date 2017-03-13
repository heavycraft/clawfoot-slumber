import { inject, bindable } from 'aurelia-framework';
import { FlickrService, IFlickrPhoto, IFlickrPhotoSize } from '../../flickr.service';

@inject(FlickrService)
export class FlickrGallery {
    @bindable photos: IFlickrPhoto[] = [];

    constructor(private flickr: FlickrService) { }

    openPhoto(photo: IFlickrPhoto, event: MouseEvent) {
        let image = <HTMLElement>event.target;
        let rect = image.getBoundingClientRect();
        let fullContainer = document.createElement('div');
        let full = document.createElement('img');
        let backdrop = document.createElement('div');

        const close = () => {
            backdrop.classList.remove('show');
            fullContainer.classList.add('fade');
            setTimeout(() => {
                document.body.removeChild(backdrop);
                document.body.classList.remove('modal-open');
                document.body.removeChild(fullContainer);
            }, 150);
        }

        backdrop.classList.add('modal-backdrop', 'fade');
        setTimeout(() => { backdrop.classList.add('show'); }, 150)

        document.body.classList.add('modal-open');
        if(!document.querySelectorAll('.modal-backdrop').length) {
            document.body.appendChild(backdrop)
        };

        full.classList.add('img-fluid', 'mh-100');
        full.src = this.largestPhotoSize(photo).source;

        fullContainer.id = 'full-'+photo.id;
        fullContainer.classList.add('flickr-gallery-image-full', 'd-flex', 'align-items-center', 'justify-content-center', 'au-animate');
        fullContainer.style.top = rect.top + 'px';
        fullContainer.style.left = rect.left + 'px';
        fullContainer.style.width = (rect.right - rect.left) + 'px';
        fullContainer.style.height = (rect.bottom - rect.top) + 'px';
        fullContainer.appendChild(full);
        fullContainer.addEventListener('click', close)
        document.addEventListener('keyup', (event) => {
            if(event.keyCode === 27) { close(); } //escape key
        })
        
        if(!document.getElementById(fullContainer.id)) { document.body.appendChild(fullContainer); }
    }

    preloadImages() {
        this.photos.forEach( photo => { 
            this.flickr.getPhotoSizes(photo.id).then( (sizes: Array<any>) => {
                photo.sizes = sizes;
                let largestPhoto = (new Image()).src = this.largestPhotoSize(photo).source;
            });
        });
    }

    largestPhotoSize(photo) {
        return photo.sizes
                    .filter( size => size.label !== 'Original')
                    .filter( (size, idx, arr) => size.height === Math.max.apply(Math, arr.map(size => size.height)))[0];
    }

    photosChanged(newPhotos) {
        if (newPhotos) { this.preloadImages(); }
    }
}

