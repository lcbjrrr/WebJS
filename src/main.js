import { createApp } from 'vue';
import App from './App.vue';
import router from './index.js';  

const app = createApp(App);

// Use the router plugin
app.use(router);

app.mount('#app');