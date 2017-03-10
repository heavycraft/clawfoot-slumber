import { inject } from 'aurelia-framework';
import { FlickrService } from '../flickr.service';
import { VimeoService } from '../vimeo.service';
import { SoundCloudService, ISoundCloudTrack } from '../soundcloud.service';


@inject(FlickrService, VimeoService, SoundCloudService)
export class Press {
    band: any;
    photos: any;
    videos: any;
    playlists: any;

    selectedTrack: ISoundCloudTrack;
    trackIsPlaying: boolean = false;
    trackTimeInterval: any;
    trackTime: number = 0;

    constructor(private flickr: FlickrService, private vimeo: VimeoService, private soundcloud: SoundCloudService) {
        flickr.getPublicPhotos(10,1,'url_m').then(photos => { this.photos = photos; });
        vimeo.getPublicVideos().then(videos => { this.videos = videos; });
        soundcloud.getUser('clawfootslumber').then(band => { this.band = band; });
        soundcloud.getUserPlaylists('clawfootslumber').then(playlists => { 
            this.playlists = playlists;
            if(playlists.length && playlists[0].tracks.length) {
                this.selectedTrack = playlists[0].tracks[0];
            }
        });
    }

    playTrack(track: ISoundCloudTrack, forceStop = true) {
        if(!track.isPlaying) {
            this.selectedTrack = track;
            if(forceStop) { this.stopAllTracks(); } //stop any playing tracks
            if(track.player.state() === 'unloaded') { this.loadTrack(track) };
            track.player.play();
            track.isPlaying = true;
            clearInterval(this.trackTimeInterval);
            this.trackTimeInterval = setInterval( (() => {
                this.trackTime = ~~(track.player.seek()*1000);
            }).bind(this), 1000);
        } else {
            this.pauseTrack(track);
        }

    }

    stopAllTracks() {
        this.playlists[0].tracks.forEach(track => { track.player.stop(); track.isPlaying = false;});
    }

    loadTrack(track: ISoundCloudTrack) {
        track.player.load();
        let loadedInterval = setInterval( () => {
            track.isLoading = track.player.state() !== 'loaded';
            if(!track.isLoading) { clearInterval(loadedInterval); }
        },500)
    }

    nextTrack() {
        let autoplay = this.selectedTrack.player.playing();
        this.selectedTrack.player.stop();
        let tracks = this.playlists[0].tracks;
        let idx = tracks.indexOf(this.selectedTrack);
        let next = idx+1 < tracks.length ? idx+1 : 0;
        this.selectedTrack = tracks[next];
        if(autoplay) {
            this.playTrack(this.selectedTrack)
        }
    }

    previousTrack() {
        let autoplay = this.selectedTrack.player.playing();
        this.selectedTrack.player.stop();
        let tracks = this.playlists[0].tracks;
        let idx = tracks.indexOf(this.selectedTrack);
        let prev = idx-1 >= 0 ? idx-1 : tracks.length-1;
        this.selectedTrack = tracks[prev];
        if(autoplay) {
            this.playTrack(this.selectedTrack)
        }
    }

    pauseTrack(track: ISoundCloudTrack) {
        track.player.pause();
        track.isPlaying = false;
        clearInterval(this.trackTimeInterval);
    }

    deactivate() {
        this.stopAllTracks();
        clearInterval(this.trackTimeInterval);
    }
}