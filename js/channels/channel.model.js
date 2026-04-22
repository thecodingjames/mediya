export default class Channel {

  #urls = []

  constructor({url, urls = [], ...channel}) {
    Object.assign(this, channel)

    this.#urls = [url, ...urls].filter(u => u)
  }

  get url() {
    const length = this.#urls.length

    return this.#urls[Math.floor(Math.random() * length)]
  }

}
