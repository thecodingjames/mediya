import ChannelsService from '../channels/channels.service.js'
import Controls from '../controls/controls.js'
import Menu from '../channels/menu.js'
import Player from '../player/player.js'

import Fullscreen from '../mixins/fullscreen.js'

const TAG = 'channel-details'

export default {

  mixins: [
    Fullscreen
  ],

  components: {
    Menu,
    Player,
  },

  props: {
    category: String,
    name: String,
  },

  data() {
    return {
      $route: null,

      channel: {},

      menu: null,
      timeout: null,
    }
  },

  computed: {
  },

  watch: {

    $route(newRoute, oldRoute) {
      this.init()
    },

    channel(newChannel, oldChannel) {
      document.title = `${this.channel.name} :: Mediya`
    },

    menu(newMenu, oldMenu) {
      if (this.menu) {
        this.startTimeout()

        this.clearMenuTriggers()
      } else {
        this.stopTimeout()

        this.setupMenuTriggers()
      }
    }

  },

  methods: {

    init() {
      this.channel = ChannelsService.findByName(this.name)

      const category = this.$route.query.menu

      if (category) {
        this.menu = {
          category, 
          controls: true,
        }
      } else {
        this.menu = null
      }
    },

    setupMenuTriggers() {
      const menuEvents = [
        Controls.Events.Left, 
        Controls.Events.Right,
        Controls.Events.Down, 
        Controls.Events.Up,   
        Controls.Events.Enter,
      ]

      menuEvents.forEach( event => {
        Controls.subscribe(event, (event)=> this.triggerMenu(event.base), TAG)
      })

      document.addEventListener('mousemove', this.triggerMenu)
      document.addEventListener('touchstart', this.triggerMenu)
    },

    clearMenuTriggers() {
      Controls.unsubscribeAll(TAG) 

      document.removeEventListener('mousemove', this.triggerMenu)
      document.removeEventListener('touchstart', this.triggerMenu)
    },

    triggerMenu(event) {
      event.preventDefault()

      this.openMenu()
    },

    openMenu() {
      this.$router.replace({ query: { menu: this.category } })
    },

    closeMenu() {
        this.$router.replace({ query: null })
    },

    startTimeout() {
      clearTimeout(this.timeout)

      this.timeout = setTimeout(() => {
        this.closeMenu()
      }, 5000)
    },

    stopTimeout() {
      clearTimeout(this.timeout)
    },

    changeCategory(category) {
      this.$router.replace({ query: { menu: category } })
    },

    changeChannel(channel) {
      this.$router.replace({ path: channel.route, query: { menu: channel.category } })

      this.requestFullscreen()
    },

  },

  mounted() {
    this.init()

    this.setupMenuTriggers()
  },

  beforeUnmount() {
    this.clearMenuTriggers()
  },

  template: `
    <div class="channel-details" style="flex-grow: 1; display: flex; flex-direction: column;">
      <Menu 
        :menu="menu?.category"

        @changedCategory="changeCategory($event)"
        @changedChannel="changeChannel($event)"

        @interaction="startTimeout()"
        @closed="closeMenu()"

        :channel
      />
      
      <Player :channel :controls="menu?.controls" />
    </div>
  `
}
