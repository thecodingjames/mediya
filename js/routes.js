import ChannelsPage from './channels/channels.page.js'
import ChannelDetailsPage from './channels/channel-details.page.js'
import SettingsPage from './settings/settings.page.js'

export default [
  { 
    path: '/', 
    component: ChannelsPage, 
  },
  { 
    path: '/:category/:name', 
    component: ChannelDetailsPage, 
    props: true 
  },
  { 
    path: '/settings', 
    component: SettingsPage, 
  },
]
