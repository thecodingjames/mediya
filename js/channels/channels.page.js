import ChannelsService from '../channels/channels.service.js'
import Controls from '../controls/controls.js'
import ChannelCard from '../channels/channel-card.js'

import Fullscreen from '../mixins/fullscreen.js'

const TAG = 'channels'

export default { 

  mixins: [
    Fullscreen
  ],

  components: {
    ChannelCard
  },

  data() { 
    return { 
      focused: {
        categoryIndex: 0,
        channelIndex: 0
      }
    } 
  },

  computed: {

    categories() {
      return ChannelsService.byCategories()
    },

    focusedElement() {
      return document.querySelector(`[categoryIndex='${this.focused.categoryIndex}'][channelIndex='${this.focused.channelIndex}']`)
    },

    focusedChannel() {
      return this.categories[this.focused.categoryIndex].channels[this.focused.channelIndex]
    },

  },

  methods: {

    channelsFor(category) {
      return ChannelsService.findByCategory(category)
    },

    isFocused({ categoryIndex, channelIndex }) {
      return (categoryIndex == this.focused?.categoryIndex && channelIndex == this.focused?.channelIndex)
    },

    handleLeft(details) {
      details.base.preventDefault()

      this.navigateChannels(-1)
    },

    handleRight(details) {
      details.base.preventDefault()

      this.navigateChannels(1)
    },

    navigateChannels(direction) {
      const channels = this.categories[this.focused.categoryIndex].channels
      const next = (this.focused.channelIndex + direction)
      const max = channels.length

      this.focused = {
        ...this.focused,
        channelIndex: (next >= 0 ? next : max - 1) % max
      }
    },

    handleUp(details) {
      details.base.preventDefault()

      this.navigateCategories(-1)
    },

    handleDown(details) {
      details.base.preventDefault()

      this.navigateCategories(1)
    },

    navigateCategories(direction) {
      const max = this.categories.length - 1

      const next = (this.focused.categoryIndex + direction)
      const wrapped = (next >= 0 ? next : max) % (max + 1)

      const channelFlip = Math.min(this.focused.channelIndex, this.categories[wrapped].channels.length - 1)

      this.focused = {
        channelIndex: channelFlip,
        categoryIndex: wrapped
      }
    },

    handleEnter(details) {
      this.openDetails(details.base, this.focusedChannel)
    },

    handleClick(event, channel) {
      if (Controls.isFireStick) {
        event.preventDefault();

        channel = this.focusedChannel
      }

      this.openDetails(event, channel)
    },

    openDetails(event, channel) {
      event.preventDefault()

      this.requestFullscreen()

      this.$router.push(channel.route)
    },

    handleSettings() {
      this.$router.push('/settings')
    },

  },

  watch: {
    focused(oldFocused, newFocused) {
      this.focusedElement?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      })

      this.focusedElement?.closest('.category')?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      })
    }
  },

  mounted() {
    document.title = 'Mediya'

    Controls.subscribe(Controls.Events.Left,  this.handleLeft,  TAG)
    Controls.subscribe(Controls.Events.Right, this.handleRight, TAG)

    Controls.subscribe(Controls.Events.Down,  this.handleDown, TAG)
    Controls.subscribe(Controls.Events.Up,    this.handleUp,   TAG)

    Controls.subscribe(Controls.Events.Enter, this.handleEnter, TAG)

    Controls.subscribe(Controls.Events.PlayPause, this.handleSettings, TAG)
  },

  beforeUnmount() {
    Controls.unsubscribeAll(TAG) 
  },

  template: `
    <div 
      class="content"
      style="padding-top: 0px;"
    >
      <component is="style">
        .category {
          scroll-margin: calc(2 * var(--base-padding)) 0px;
        }

        .channels-list {
          display: flex;
          gap: var(--base-padding);

          overflow-x: scroll;
          scrollbar-width: none;
        }

        h1 {
          font-size: 3rem;
          margin-bottom: 0;
        }
      </component>

      <div style="position: fixed; right: var(--base-padding); top: 1rem;">
        <q-btn @click="handleSettings()" round color="primary" icon="settings" />
      </div>

      <div 
        v-for="(category, categoryIndex) in categories" 
        :key="category.name"

        class="category"
      >
        <h1>{{ category.name }}</h1>

        <div class="channels-list" >
          <ChannelCard
            v-for="(channel, channelIndex) in category.channels"
            :key="channel.name"

            :focused="isFocused({ channelIndex, categoryIndex})"
            :categoryIndex="categoryIndex"
            :channelIndex="channelIndex"

            :channel="channel"
            @click="handleClick($event, channel)"
          />
        </div>
      </div>
    </div>
  `
}
