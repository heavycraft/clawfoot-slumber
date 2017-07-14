import { inject, NewInstance } from 'aurelia-framework';
import { EventAggregator } from 'aurelia-event-aggregator';
import { Howl } from 'howler';
import { HttpService } from './http.service';
import * as process from './process.env';

const BASE_URL = process.env.SOUNDCLOUD_BASE_URL;
const CLIENT_ID = process.env.SOUNDCLOUD_CLIENT_ID;

export interface ISoundCloudUser {
    id: number;
    permalink: string;
    username: string;
    uri: string;
    permalink_url: string;
    avatar_url: string;
    country: string;
    full_name: string;
    city: string;
    description: string;
    discogs_name: string;
    myspace_name: string;
    website: string;
    website_title: string;
    online: boolean;
    track_count: number;
    playlist_count: number;
    followers_count: number;
    followings_count: number;
    public_favorites_count: number;
    avatar_data?: any;
}

export interface ISoundCloudTrack {
    id: number;
    created_at: string;
    user_id: number;
    user: ISoundCloudUser;
    title: string;
    permalink: string;
    permalink_url: string;
    uri: string;
    sharing: 'public' | 'private';
    embeddable_by: 'all' | 'me' | 'none';
    purchase_url: string;
    artwork_url: string;
    description: string;
    label: ISoundCloudUser;
    duration: number;
    genre: string;
    tag_list: string;
    label_id: number;
    label_name: string;
    release: number;
    release_month: number;
    release_year: number;
    streamable: boolean;
    downloadable: boolean;
    state: 'processing' | 'failed' | 'finished';
    license: 'no-rights-reserved' | 'all-rights-reserved' | 'cc-by' | 'cc-by-nc' | 'cc-by-nd' | 'cc-by-sa' | 'cc-by-nc-nd' | 'cc-by-nc-sa';
    track_type: 'original' | 'remix' | 'live' | 'recording' | 'spoken' | 'podcast' | 'demo' | 'in progress' | 'stem' | 'loop' | 'sound effect' | 'sample' | 'other';
    waveform_url: string;
    download_url: string;
    stream_url: string;
    video_url: string;
    bpm: number;
    commentable: boolean;
    isrc: string;
    key_signature: string;
    comment_count: number;
    download_count: number;
    playback_count: number;
    favoritings_count: number;
    original_format: string;
    original_content_size: number;
    asset_data: any;
    artwork_data: any;
    user_favorite: boolean;
    attachments_uri: string;
    //these are custom fields to attach a player
    player?: Howl; 
    isPlaying?: boolean;
    isLoading?: boolean;
}

export interface ISoundCloudPlaylist {
    id: number;
    kind: string;
    created_at: string;
    user_id: number;
    user: ISoundCloudUser;
    title: string;
    permalink: string;
    permalink_url: string;
    uri: string;
    sharing: 'public' | 'private';
    embeddable_by: 'all' | 'me' | 'none';
    purchase_url: string;
    purchase_title: string;
    artwork_url: string;
    description: string;
    label: ISoundCloudUser;
    duration: number;
    genre: string;
    tag_list: string;
    label_id: number;
    label_name: string;
    license: 'no-rights-reserved' | 'all-rights-reserved' | 'cc-by' | 'cc-by-nc' | 'cc-by-nd' | 'cc-by-sa' | 'cc-by-nc-nd' | 'cc-by-nc-sa';
    release: number;
    relese_day: number;
    release_month: number;
    release_year: number;
    streamable: boolean;
    downloadable: boolean;
    ean: string;
    playlist_type: 'ep single' | 'album' | 'compilation' | 'project files' | 'archive' | 'showcase' | 'demo' | 'sample pack' | 'other';
    tracks: Array<ISoundCloudTrack>;
}

@inject(EventAggregator, NewInstance.of(HttpService))
export class SoundCloudService {
    user: Array<ISoundCloudUser> = [];
    user_playlists: Array<ISoundCloudPlaylist> = [];
    user_tracks: Array<ISoundCloudTrack> = [];
    params: any;

    constructor(private ea: EventAggregator, private http: HttpService) {
        this.http.configure({ base_url: BASE_URL });
        this.params = { client_id: CLIENT_ID };
    }

    getUser(uid: number | string, q?: string): Promise<ISoundCloudUser> {
        if (this.user && this.user.hasOwnProperty(uid) ) { return new Promise(resolve => resolve(this.user[uid])); }
        const userParse = (data) => {
            const user = JSON.parse(data.response);
            this.user[uid] = Object.assign(user, {
                description: user.description.replace(/\r/g, '').replace(/\n/g, '<br/>')
            }); 
            return this.user[uid];
        };
        return this.http.getData(`/users/${uid}`, this.params, userParse);
    }

    getUserTracks(uid: number | string ): Promise<ISoundCloudTrack[]> {
        if (this.user_tracks && this.user_tracks.hasOwnProperty(uid)) { return new Promise( resolve => resolve(this.user_tracks[uid]));}
        const parseTrackData = (data) => this.user_tracks[uid] = JSON.parse(data.response)
            .map( (track: ISoundCloudTrack ) => Object.assign(track, { 
                player: new Howl({
                    src: [`${track.stream_url}?client_id=${CLIENT_ID}`],
                    format: [track.original_format],
                    autoplay: false,
                    preload: false
                }) 
            }))

        return this.http.getData(`/users/${uid}/tracks`, this.params, parseTrackData);
    }

    getUserPlaylists(uid: number | string, representation?: 'compact' | 'id', q?: string): Promise<Array<ISoundCloudPlaylist>> {
        if (this.user_playlists && this.user_playlists.hasOwnProperty(uid) ) { return new Promise(resolve => resolve(this.user_playlists[uid])); }
        const parsePlaylistData = (data) => this.user_playlists[uid] = JSON.parse(data.response)
                .map((playlist: ISoundCloudPlaylist) => {
                    playlist.tracks.forEach(track => {
                        track.player = new Howl({
                            src: [`${track.stream_url}?client_id=${CLIENT_ID}`],
                            format: [track.original_format],
                            autoplay: false,
                            preload: false
                        });
                    });
                    return playlist;
                });

        return this.http.getData(`/users/${uid}/playlists`, this.params, parsePlaylistData);
    }

}