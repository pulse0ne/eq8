import Vue from 'vue';
import App from './App.vue';

Vue.config.productionTip = false;
Vue.prototype.$noOp = () => {};
Vue.prototype.$port = browser.runtime.connect();
Vue.prototype.$arrayCopy = arr => JSON.parse(JSON.stringify(arr));

new Vue({ render: h => h(App) }).$mount('#app');
