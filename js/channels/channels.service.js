import Channel from '../channels/channel.model.js'

class ChannelsService {
    #categorized

    constructor(categorized) {
        this.#categorized = categorized
    }

    static async load() {
        const categorized = await fetch(rootUrl('/channels.json'))
            .then( r => r.json() )
            .then( categories => {
                // Add corresponding data to every channel
                return categories.map(category => {
                    const channels = category.channels
                      .filter(c => !c.hidden)
                      .map(c => new Channel(c))

                    const channelsWithCategory = channels.map(channel => {
                        const categoryName = category.category
                        channel.category = categoryName

                        const lowercaseName = channel.name.toLowerCase()
                        channel.logo = rootUrl(`/assets/logos/${lowercaseName}.png`)
                        channel.route = `/${categoryName}/${lowercaseName}`

                        return channel
                    })

                    return {
                      name: category.category,
                      icon: category.icon,
                      channels: channelsWithCategory
                    }
                })
            })

        return new ChannelsService(categorized)
    }

    get channels() {
      return this.categorized.reduce((channels, category) => [...channels, ...category.channels], [])
    }

    get categorized() {
      return this.#categorized.reduce((categories, { channels, ...category }) => {
        channels = channels.filter(channel => {
          if (!channel.dates) {
            return true
          }

          const [start, end] = channel.dates.split('-').map(date => { 
            const parts = date.split('/').map(d => Number(d)); 
            const year = (new Date()).getFullYear()

            return {
              day: parts[0], 
              month: parts[1],
              year,

              getFullYear() {
                return this.year
              },

              getMonth() {
                return this.month - 1 // -1 to match date.getMonth() zero-based
              },

              getDate() {
                return this.day
              }
            }
          })

          const today = new Date()

          // Account for dates range overlapping years
          if (today.getMonth() > end.month) {
            end.year = end.year + 1
          }

          if (today.getMonth() < start.month) {
            start.year = start.year - 1
          }

          //YYYYMMDD
          const format = (date) => `${date.getFullYear()}${date.getMonth()}${date.getDate()}`

          return format(today) >= format(start) && format(today) <= format(end)
        })
        return [
          ...categories, 
          {
            ...category,
            channels
          }
        ]
      }, [])
    }

    categories() {
      return this.categorized.map(({ channels, ...category }) => category)
    }

    byCategories() {
       return this.categorized
    }

    findByCategory(category) {
      return this.categorized.filter( c => {
        return c.name.toLowerCase() == category.toLowerCase() 
      }).at(0)?.channels ?? []
    }

    findIndexInCategoryByName(name = "") {
      for(const category of this.categorized) {
        const foundIndex = category.channels.findIndex( c => {
          return c.name.toLowerCase() == name.toLowerCase() 
        })

        if (foundIndex >= 0) {
          // Break the loop and exit function
          return foundIndex
        }
      }
    }

    findByName(name) {
      return this.channels.find(channel => channel.name.toLowerCase() == name.toLowerCase())
    }

}

const service = await ChannelsService.load()

export default service
