import Controls from '/js/controls/controls.js'
import ChannelsService from '/js/channels/channels.service.js'
import Channel from '/js/channels/channel.model.js'

import Fullscreen from '/js/mixins/fullscreen.js'

const TAG = 'player'

export default {

  mixins: [
    Fullscreen
  ],

  props: {
    channel: Object,
    controls: false,
  },

  data() {
    return {
      previewCategory: null,
      previewIndex: 0,
      currentTime: null,

      playing: false,
    }
  },

  computed: {
    player() {
      return videojs.getPlayer(this.$refs.videojs) ?? videojs(this.$refs.videojs)
    },

    previews() {
      const defaultMode = () => this.player.audioPosterMode(false)
      const audioOnly = () => this.player.audioPosterMode(true)

      const previews = {
        tv: [
          defaultMode,
          audioOnly,
        ],
      }

      return previews[this.channel.category] ?? [ defaultMode ]
    },

    manualSeek() {
      return !!this.currentTime
    }
  },

  watch: {
    channel(newChannel, oldChannel) {
      this.currentTime = null

      if (!this.channel) {
          return
      }

      const { url, type, logo, category } = Vue.toRaw(this.channel)

      this.player.src({ 
        src: url,
        type,
      })

      this.player.poster(logo)
      this.player.play()

      if (this.channel.category != this.previewCategory) {
        // New category, reset preview
        this.previewIndex = 0 
      }
      this.previewCategory = this.channel.category
    },

    previewIndex(newIndex, oldIndex) {
      this.previews[this.previewIndex]()
    },

    playing(newPlaying, oldPlaying) {
      if (newPlaying) {
        this.requestFullscreen()
      }
    },

  },

  methods: {

    handlePlayPause(event) {
      event.base.preventDefault()

      if (this.playing) {
        this.player.pause()
      } else {
        this.player.play()
      }
    },

    handlePause() {
      this.player.pause()
    },

    handlePreviousPreview() {
      this.navigatePreviews(-1) 
    },

    handleNextPreview() {
      this.navigatePreviews(1) 
    },

    handlePlayerSeeking() {
      if (this.manualSeek) {
        // Ignore initial load seek
        this.currentTime = this.player.currentTime()
      }
    },

    handlePlayerSeeked() {
      if (this.manualSeek) {

        if (this.player.currentTime() > this.currentTime) {
          this.navigatePreviews(1) 
        } else {
          this.navigatePreviews(-1) 
        }

        // Keep previous position, using el() to NOT trigger seek events
        this.player.el().currentTime = this.currentTime

      } else {
        this.currentTime = this.player.currentTime()
      }
    },

    navigatePreviews(direction) {
      if (this.playing) {
        const newIndex = this.previewIndex + direction
        const wrapped = newIndex < 0 ? (this.previews.length - 1) : newIndex % this.previews.length

        this.previewIndex = wrapped
      }
    },

    handlePlayingPaused(event) {
      this.playing = (event.type == 'play')
    },

  },

  mounted() {
    Controls.subscribe(Controls.Events.PlayPause, this.handlePlayPause, TAG)
    Controls.subscribe(Controls.Events.Rewind,    this.handlePreviousPreview, TAG)
    Controls.subscribe(Controls.Events.Forward,   this.handleNextPreview, TAG)

    this.player.on('seeking', this.handlePlayerSeeking)
    this.player.on('seeked', this.handlePlayerSeeked)

    this.player.on('play', this.handlePlayingPaused)
    this.player.on('pause', this.handlePlayingPaused)
  },

  beforeUnmount() {
    this.player?.dispose();

    Controls.unsubscribeAll(TAG)

    this.player.off('seeking', this.handlePlayerSeeking)
    this.player.off('seeked', this.handlePlayerSeeked)

    this.player.off('play', this.handlePlayingPaused)
    this.player.off('pause', this.handlePlayingPaused)
  },

  template: `
    <div class="player" style="flex-grow: 1; position: relative;">
      <component is="style">
        .player {
          --controls-size: 3rem;
          --controls-padding: 1rem;
        }

        .player .video-js .vjs-control-bar {
          display: none !important;
        }

        .player .overlay {
          position: absolute;
          z-index: 1;
          height: 100%;
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .player .controls {
          padding: var(--controls-padding);
          font-size: var(--controls-size);
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .player .controls:hover, .player .vjs-big-play-button:hover {
          cursor: pointer;
          color: #555;
        }

        .player .vjs-big-play-button {
          --play-size: calc(var(--controls-size) + var(--controls-padding) * 2);
          --play-margin: calc(var(--play-size) / -2);
          font-size: var(--controls-size);
          border: none;
          background-color: transparent; 
          background-image: radial-gradient(black, transparent);
          border-radius: 100%;
          height: var(--play-size);
          line-height: var(--play-size);
          width: var(--play-size);
          margin-top: var(--play-margin);
          margin-left:  var(--play-margin);
          pointer-events: initial;
        }

        .player .video-js:hover .vjs-big-play-button {
          background-color: transparent !important;
        }

        .player .video-js {
          pointer-events: none;
        }

        @media (max-width: 480px) {
          .player {
            --controls-size: 2rem;
            --controls-padding: 0.75rem;
          }
        }
      </component>

      <div 
        v-if="controls && playing" 
        class="overlay"
      >
        <div 
          @click="handlePreviousPreview()"
          class="controls"
          style="border-radius: 0 50% 50% 0; background-image: linear-gradient(to right, black, transparent);"
        >
          <q-icon name="fast_rewind"/>
        </div>

        <div 
          @click="handlePause()"
          class="controls"
          style="border-radius: 100%; background-image: radial-gradient(black, transparent);"
        >
          <q-icon name="pause"/>
        </div>

        <div 
          @click="handleNextPreview()"
          class="controls"
          style="border-radius: 50% 0 0 50%; background-image: linear-gradient(to left, black, transparent);"
        >
          <q-icon name="fast_forward"/>
        </div>
      </div>

      <video 
          ref="videojs" 
          controls autoplay
          class="video-js vjs-big-play-centered vjs-show-big-play-button-on-pause" 
          style="width: 100%; height: 100%;"
      ></video>

    </div>
  `
}
