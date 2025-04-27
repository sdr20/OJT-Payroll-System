import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import { createVuetify } from 'vuetify';
import 'vuetify/styles'; // Import Vuetify styles
import * as components from 'vuetify/components'; // Import all Vuetify components
import * as directives from 'vuetify/directives'; // Import all Vuetify directives
import { aliases, mdi } from 'vuetify/iconsets/mdi'; // Import MDI icons
import '@mdi/font/css/materialdesignicons.css'; // Import MDI font CSS
import './assets/tailwind.css';

// Create Vuetify instance
const vuetify = createVuetify({
  components,
  directives,
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi,
    },
  },
});

const app = createApp(App);
app.use(store);
app.use(router);
app.use(vuetify); // Add Vuetify to the app
app.mount('#app');