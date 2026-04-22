import SettingsService from '../settings/settings.service.js'

export default {
  methods: {
    requestFullscreen() {
      if (SettingsService.requestFullscreen) {
        this.$q.fullscreen.request().catch(_ => {})// Nothing to do...
      }
    }
  }
}
