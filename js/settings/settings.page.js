import SettingsService from '/js/settings/settings.service.js'
import Controls from '/js/controls/controls.js'
import Fullscreen from '/js/mixins/fullscreen.js'

const TAG = 'settings'

export default { 

  mixins: [
    Fullscreen
  ],

  data() { 
    return { 
      settings: {},
      focusedIndex: 0,
    } 
  },

  computed: {

  },

  methods: {

    handlePrevious(details) {
      details.base.preventDefault()

      this.navigate(-1)
    },

    handleNext(details) {
      details.base.preventDefault()

      this.navigate(1)
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

    },

    handleClick(event, channel) {
      if (Controls.isFireStick) {
        event.preventDefault();

        channel = this.focusedChannel
      }

      this.openDetails(event, channel)
    },

    handleToggle(setting) {
      const newValue = !this.settings[setting]
      this.settings[setting] = newValue

      SettingsService[setting] = newValue
    },

    handleBackHome() {
      this.$router.push('/')
    },

    formatSettingName(name) {
      return name
              .split(/([A-Z])/)
              .join(' ')
              .replace(/([A-Z]) /, (match, letter) => letter)
    }

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
    this.requestFullscreen()
    this.settings = structuredClone(SettingsService.all)

    Controls.subscribe(Controls.Events.Up,    this.handlePrevious, TAG)
    Controls.subscribe(Controls.Events.Down,  this.handleNext, TAG)

    Controls.subscribe(Controls.Events.Enter, this.handleEnter, TAG)

    Controls.subscribe(Controls.Events.PlayPause, this.handleBackHome, TAG)
  },

  beforeUnmount() {
    Controls.unsubscribeAll(TAG) 
  },

  template: `
    <div 
      class="content"
      style="padding-top: 0px;"
    >
      <h1>settings</h1>

      <div style="display: flex; flex-direction: column; gap: 2rem;" >
        <q-list>
          <q-item v-for="(value, setting) in settings" @click.self="handleToggle(setting)" tag="label">
            <q-item-section avatar>
              <q-toggle @click="handleToggle(setting)" color="primary" v-model="value" />
            </q-item-section>
            <q-item-section>
              <q-item-label style="user-select: none; text-transform: capitalize;">{{ formatSettingName(setting) }}</q-item-label>
            </q-item-section>
          </q-item>
         </q-list>

        <q-btn to="/" style="align-self: start; margin-left: 16px;" color="primary" label="Done" />
      </div>
    </div>
  `
}
