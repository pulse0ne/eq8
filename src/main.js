import Vue from 'vue';
import App from './App.vue';

Vue.config.productionTip = false;
Vue.prototype.$noOp = () => {};
Vue.prototype.$port = browser.runtime.connect();

new Vue({ render: h => h(App) }).$mount('#app');
