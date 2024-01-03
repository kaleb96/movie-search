import { createApp } from 'vue'
import { createVuetify } from 'vuetify'

import App from './App.vue'
import 'vuetify/dist/vuetify.min.css';
const app = createApp(App)
const vuetify = createVuetify();
import '@mdi/font/css/materialdesignicons.css';

app.use(vuetify);
app.mount('#app')
