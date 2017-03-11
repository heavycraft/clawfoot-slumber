import { bindable } from 'aurelia-framework';
import { ISoundCloudPlaylist, ISoundCloudTrack } from '../../soundcloud.service';

export class SoundCloudPlayer {
  @bindable playlist: ISoundCloudPlaylist;
  @bindable autoplay: boolean;
  selectedTrack: ISoundCloudTrack;
  trackIsPlaying: boolean = false;
  trackTimeInterval: any;
  trackTime: number = 0;

  playlistChanged(playlist) {
    this.selectedTrack = this.playlist.tracks[0];
  }

  playTrack(track: ISoundCloudTrack, forceStop = true) {

    if (!track.isPlaying) {
      this.selectedTrack = track;
      if (forceStop) { this.stopAllTracks(); } //stop any playing tracks
      if (track.player.state() === 'unloaded') { 
        this.loadTrack(track);
        return;
      }
      track.player.play();
      track.isPlaying = true;
      clearInterval(this.trackTimeInterval);
      this.trackTimeInterval = setInterval((() => {
        this.trackTime = ~~(track.player.seek() * 1000);
      }).bind(this), 1000);
    } else {
      this.pauseTrack(track);
    }

  }

  stopAllTracks() {
    this.playlist.tracks.forEach(track => { track.player.stop(); track.isPlaying = false; });
  }

  loadTrack(track: ISoundCloudTrack) {
    track.player.load();
    let loadedInterval = setInterval(() => {
      track.isLoading = track.player.state() !== 'loaded';
      if (!track.isLoading) { 
        clearInterval(loadedInterval); 
        //ensure it is the same track as the newest selected track
        if(track === this.selectedTrack) { this.playTrack(track); }
      }
    }, 500)
  }

  nextTrack() {
    let autoplay = this.selectedTrack.player.playing();
    this.selectedTrack.player.stop();
    let tracks = this.playlist.tracks;
    let idx = tracks.indexOf(this.selectedTrack);
    let next = idx + 1 < tracks.length ? idx + 1 : 0;
    this.selectedTrack = tracks[next];
    if (autoplay) {
      this.playTrack(this.selectedTrack)
    }
  }

  previousTrack() {
    let autoplay = this.selectedTrack.player.playing();
    this.selectedTrack.player.stop();
    let tracks = this.playlist.tracks;
    let idx = tracks.indexOf(this.selectedTrack);
    let prev = idx - 1 >= 0 ? idx - 1 : tracks.length - 1;
    this.selectedTrack = tracks[prev];
    if (autoplay) {
      this.playTrack(this.selectedTrack)
    }
  }

  pauseTrack(track: ISoundCloudTrack) {
    track.player.pause();
    track.isPlaying = false;
    clearInterval(this.trackTimeInterval);
  }

  detached() {
    this.stopAllTracks();
    clearInterval(this.trackTimeInterval);
  }
}

