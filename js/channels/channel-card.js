import Controls from '../controls/controls.js'
import Channel from '../channels/channel.model.js'

export default {

    props: {
        channel: Channel,
        focused: Boolean,
        responsive: {
          type: Object,
          default(raw) {
            return {
              portrait: '50vw',
              hd: '10vw',
              full: '14vw',
              ...raw
            }
          }
        }
    },

    computed: {
      isFireStick() {
        return Controls.isFireStick
      },
    },

    methods: {
      handleDefaultLogo(event) {
        event.target.src = rootUrl('/assets/logos/default.png')
      },
    },

    template: `
      <div class="channel-card" style="display: flex; align-items: center;">
        <component is="style">
          .channel-card .q-card {
            width: {{ responsive.full }};
            aspect-ratio: 16/10;
            margin: 2px 0;
          }

          .channel-card a:focus>.q-card:not(.q-card-focused),.q-card {
            border-radius: 12px;
            border: 6px solid transparent;
          }

          .channel-card .q-card-focused {
            border-color: var(--q-primary);
          }

          .channel-card .q-card__section {
            padding: 8px;
          }

          .channel-card .q-card:hover {
            {{ isFireStick ? '' : 'background-color: #555;' }}
            cursor: pointer;
          }

          @media (max-width: 1280px) {
            .channel-card .q-card {
              width: {{ responsive.hd }};
            }
          }

          @media (orientation:portrait) {
            .channel-card .q-card {
              width: {{ responsive.portrait }};
              aspect-ratio: 4/3;
            }
          }
        </component>

        <q-card 
          :class="{ 'q-card-focused': focused }"
        >
          <q-card-section
            style="height: 100%; display: flex; flex-direction: column; gap: 4px; align-items: center;"
          >
            <img 
              :src="channel.logo" 
              @error="handleDefaultLogo($event)"
              style="width: 100%; height: inherit; object-fit: contain; flex-grow: 1;"
            >

            <div v-if="false" style="margin-top: 8px;">
              <div class="text-subtitle1">Titre</div>
              <div class="text-subtitle2">Heures</div>
            </div>
          </q-card-section>
        </q-card>  
      </div>
    `
}
