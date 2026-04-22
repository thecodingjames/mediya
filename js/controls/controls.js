class Controls {
    #subscribers

    get Events() {
      const events = [
        'Enter',
        'Up',
        'Down',
        'Left',
        'Right',
        'PlayPause',
        'Rewind',
        'Forward',
      ]

      const enumerated = {}
      events.forEach(e => enumerated[e] = e)
      
      return Object.freeze(enumerated)
    }

    get isFireStick() {
      return navigator?.userAgent?.toLowerCase()?.match('silk')
    }

    get isNvidiaShield() {
      return navigator?.userAgent?.toLowerCase()?.match('smart-tv; linux; smart tv')
    }

    constructor() {
      this.#subscribers = { }
      Object.values(this.Events).forEach(e => this.#subscribers[e] = [])

      document.addEventListener('keydown', this.#handleKeypress)

      // Handle Cursor mode on Fire Stick Silk Browser
      if (this.isFireStick || this.isNvidiaShield) {
        document.addEventListener('click', this.#handleMouseClick)
        document.addEventListener('mousemove', this.#handleMouseMove)
      }
    }

    #handleKeypress = (base) => {
      if (base.altKey || base.ctrlKey || base.metaKey || base.shiftKey) {
        return
      }

      const keyMaps = {
        [this.Events.Enter]:     ['Enter', 13],
        [this.Events.Up]:        ['ArrowUp', 38],
        [this.Events.Down]:      ['ArrowDown', 40],
        [this.Events.Left]:      ['ArrowLeft', 37],
        [this.Events.Right]:     ['ArrowRight', 39],
        [this.Events.PlayPause]: ['Space', 'MediaPlayPause', 179],
        [this.Events.Rewind]:    ['PageUp', 'MediaRewind', 227],
        [this.Events.Forward]:   ['PageDown', 'MediaFastForward', 228],
      }

      for (const [eventKey, maps] of Object.entries(keyMaps)) {
        const match = maps.find(map => (map == base.key) || (map == base.code))

        if (match) {
            this.#notify(eventKey, base)
            break;
        }
      }
    }

    #handleMouseClick = (base) => {
      if (base.button == 0) { // Left click
          this.#notify(this.Events.Enter, base)
      } 
    }

    #lastMove = {
        tick: Date.now(),
        position: null,
        timeout: null
    }

    #handleMouseMove = (base) => {
        const currentTick = Date.now()
        const { x, y } = base

        if (!this.#lastMove.position) {
            // Initial position
            this.#lastMove.position = { x, y }
            return
        }

        const DEBOUNCE = 250
        const TOLERANCE = 1

        const lastX = this.#lastMove.position.x
        const lastY = this.#lastMove.position.y

        const offsetX = x - lastX
        const offsetY = y - lastY

        const matchTolerance = Math.abs(offsetX) > TOLERANCE || Math.abs(offsetY) > TOLERANCE

        if (matchTolerance) {
            const angle = Math.atan2(offsetY, offsetX)

            const directions = {
                [this.Events.Up]: (
                    angle >= (-3 * Math.PI / 4) && angle < (-Math.PI / 4) 
                ),
                [this.Events.Down]: (
                    angle >= (Math.PI / 4) && angle < (3 * Math.PI / 4) 
                ),
                [this.Events.Right]: (
                    angle >= (-Math.PI / 4) && angle < (Math.PI / 4) 
                ),
                [this.Events.Left]: (
                    (angle >= (3 * Math.PI / 4) && angle <= (Math.PI)) 
                    || (angle >= (-Math.PI) && angle < (-3 * Math.PI / 4))
                )
            }

            const currentEvent = Object.entries(directions).find( ([_, condition]) => {
               return condition 
            })[0]

            base.controlsData = {
                lastX, x,
                lastY, y
            }

            const delay = (currentTick - this.#lastMove.tick)
            const debounced = delay > DEBOUNCE 

            if (debounced) {
                this.#lastMove.tick = currentTick
                this.#lastMove.position = { x, y }

                this.#notify(currentEvent, base)
            } else {
                clearTimeout(this.#lastMove.timeout)

                this.#lastMove.timeout = setTimeout(() => {
                    this.#lastMove.position = { x, y }
                }, DEBOUNCE - delay)
            }
        }
    }

    subscribe(event, callback, tag) {
        this.#subscribers[event].push({ callback, tag })
    }

    unsubscribe(event, callback, tag) {
      let events = this.#subscribers[event]

      const findSubscriber = (callback) => {
        return events.findIndex(subscriber => {
          return (
            subscriber.callback == callback
            && (tag ? (subscriber.tag == tag) : true)
          )
        })
      }

      let index
      while( (index = findSubscriber(callback)) >= 0) {
        const tagged = tag ? `${tag}.` : ''

        console.log(`Unsubscribed ${tagged}${event}`)
        events.splice(index, 1)
      }
    }

    unsubscribeAll(tag) {
      for(const [event, subscriptions] of Object.entries(this.#subscribers)) {
        const tagged = subscriptions.filter(sub => sub.tag == tag)

        tagged.forEach(sub => this.unsubscribe(event, sub.callback, tag))
      }
    }

    // Private

    #notify(event, base) {
        console.log(`Controls.Event.${event}`, base)
        this.#subscribers[event].forEach( subscriber => { 
            subscriber.callback({ event, base }) 
        })
    }
}

const controls = new Controls()

export default controls
