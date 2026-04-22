const KEY = 'mediya.settings'

const DEFAULTS = Object.freeze({
  requestFullscreen: true,
})

class SettingsService {
    #settings

    constructor(settings) {
      const storedSettings = localStorage.getItem(KEY) ?? '{}'
      this.#settings = JSON.parse(storedSettings)
    }

    get all() {
      return Object.freeze({
        ...DEFAULTS,
        ...this.#settings
      })
    }

    set(key, value) {
      if (this.all.hasOwnProperty(key)) {
        this.#settings[key] = value

        localStorage.setItem(KEY, JSON.stringify(this.#settings))

        return true
      }
    }
}

const proxy = {

  get(target, prop, receiver) {
    return target[prop] ?? target['all'][prop]
  },

  set(target, prop, value) {
    return target['set'](prop, value)
  }

}

const service = new Proxy(new SettingsService(), proxy)

export default service
