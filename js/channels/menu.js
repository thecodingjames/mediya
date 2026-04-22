import Controls from '/js/controls/controls.js'
import ChannelsService from '/js/channels/channels.service.js'
import ChannelCard from '/js/channels/channel-card.js'

const TAG = 'menu'

export default {

  components: {
    ChannelCard
  },

  props: {
    menu: null,

    channel: null,
  },

  emits: [
    'changedCategory',
    'changedChannel',

    'closed',
    'interaction',
  ],

  data() {
    return {
      channelIndex: 0,
    }
  },

  computed: {

    categories() {
      return ChannelsService.categories()
    },

    focusedChannel() {
      return this.channelsFor(this.menu)[this.channelIndex]
    },

  },

  watch: {

    channel(newChannel, oldChannel) {
      this.channelIndex = ChannelsService.findIndexInCategoryByName(this.channel.name)
    },

    channelIndex(newIndex, oldIndex) {
      this.scrollToChannel()
      this.handleMenuInteraction()
    },

    menu(newMenu, oldMenu) {
      if (!oldMenu) {
        // Menu was triggered by details
        // avoid running again when changing category
        this.setupMenuControls()
      }

      if (this.menu) {
        if (this.menu != this.channel.category) {
          this.channelIndex = 0
        } else {
          this.channelIndex = ChannelsService.findIndexInCategoryByName(this.channel.name)
        }

        this.scrollToChannel()
      } else {
        this.clearMenuControls()
      }
    },

  },

  methods: {

    channelsFor(category) {
      return category ? ChannelsService.findByCategory(category) : []
    },

    setupMenuControls() {
      Controls.subscribe(Controls.Events.Left,  this.handleLeft,  TAG)
      Controls.subscribe(Controls.Events.Right, this.handleRight, TAG)

      Controls.subscribe(Controls.Events.Down,  this.handleDown, TAG)
      Controls.subscribe(Controls.Events.Up,    this.handleUp,   TAG)

      Controls.subscribe(Controls.Events.Enter, this.handleEnter, TAG)

      document.addEventListener('mousemove', this.handleMenuInteraction)
      document.addEventListener('touchstart', this.handleMenuInteraction)
    },

    clearMenuControls() {
      Controls.unsubscribeAll(TAG) 

      document.removeEventListener('mousemove', this.handleMenuInteraction)
      document.removeEventListener('touchstart', this.handleMenuInteraction)
    },

    handleMenuInteraction() {
      this.$emit('interaction')
    },

    handleUp(details) {
      this.categoryNavigation(-1, details.base)
    },

    handleDown(details) {
      this.categoryNavigation(1, details.base)
    },

    categoryNavigation(direction, event) {
      event.preventDefault()

      const index = this.categories.findIndex(category => category.name == this.menu)
      const newIndex = index + direction
      const wrapped = newIndex < 0 ? (this.categories.length - 1) : newIndex % this.categories.length
      const newCategory = this.categories[wrapped]

      this.changedCategory(newCategory)
    },

    changedCategory(category) {
      this.$emit('changedCategory', category.name)
    },

    handleLeft(details) {
      this.channelNavigation(-1, details.base)
    },

    handleRight(details) {
      this.channelNavigation(1, details.base)
    },

    channelNavigation(direction, event) {
      event.preventDefault()

      const channels = this.channelsFor(this.menu)
      const next = (this.channelIndex + direction)
      const max = channels.length

      this.channelIndex = (next >= 0 ? next : max - 1) % max
    },

    handleEnter(details) {
      this.changedChannel(this.focusedChannel, details.base)
    },

    handleClickChannel(event, channel) {
      if (Controls.isFireStick) {
        event.preventDefault();

        channel = this.focusedChannel
      }

      this.changedChannel(channel, event)
    },

    changedChannel(newChannel, event) {
      event.preventDefault()

      this.$emit('changedChannel', newChannel)
    },

    scrollToChannel() {
      this.$nextTick(() => {
        document.querySelector(`.menu [channelIndex='${this.channelIndex}']`)?.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest'
        })
      })
    },

    handleClosedClick() {
      this.$emit('closed')
    }

  },

  mounted() {

  },

  beforeUnmount() {
    this.clearMenuControls()
  },

  template: `
    <div class="menu" v-show="menu">
      <component is="style">
        .channel-details .q-tabs__content {
          display: flex !important;
          flex-direction: column;
        }
      </component>

      <q-toolbar class="bg-indigo text-white">
        <q-btn 
          to="/" 
          icon="home" 
          flat round dense class="q-mr-xs" 
        />

        <q-toolbar-title>
          {{ channel.name }}
        </q-toolbar-title>

        <q-btn 
          @click="handleClosedClick()"
          icon="unfold_less" 
          flat round dense class="q-mr-xs" 
        />
      </q-toolbar>

      <div style="display: flex; align-items: center; background-color: rgb(48, 63, 159);">
        <q-tabs
          :model-value="menu"
          vertical
          class="bg-indigo-8 text-white"
        >
          <q-tab
            v-for="category in categories"
            @click="changedCategory(category)"

            :name="category.name"
            :label="category.name"
            :icon="category.icon"
          />
        </q-tabs>

        <div style="padding: calc(0.75 * var(--base-padding)); scroll-padding: calc(0.75 * var(--base-padding)); flex-grow: 1; overflow-x: scroll; scrollbar-width: none; display: flex; gap: var(--base-padding);">
          <ChannelCard
            v-for="(channel, index) in channelsFor(menu)"
            :channelIndex="index"

            :focused="channelIndex == index"
            :channel
            :responsive="{ portrait: '20vw', hd: '10vw', full: '10vw' }"

            @click="handleClickChannel($event, channel)"
          />
        </div>
      </div>
    </div>
  `
}
