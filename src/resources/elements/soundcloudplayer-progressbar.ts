import { bindable, inject } from 'aurelia-framework';
import { ISoundCloudTrack } from '../../soundcloud.service';

@inject(Element)
export class SoundCloudPlayerProgressbar {
    @bindable track: ISoundCloudTrack;
    @bindable time: number;
    percent: number = 0;
    
    constructor(private el: Element) {
        el.addEventListener('click', this.updateProgress.bind(this))
    }

    updateProgress(event: MouseEvent) {
        if(this.track && this.track.isPlaying) {
            let rect: ClientRect = this.el.getBoundingClientRect();
            let width: number = rect.right - rect.left;
            let percent: number = (event.pageX - rect.left) / width;
            this.track.player.seek( this.track.player.duration() * percent)
        }
    }

    timeChanged(newTime) {
        this.percent = newTime / this.track.duration;
    }
}