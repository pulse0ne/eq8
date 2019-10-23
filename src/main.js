import Vue from 'vue';
import App from './App';

Vue.config.devtools = false;
Vue.config.productionTip = false;
Vue.prototype.$noOp = () => {};
Vue.prototype.$runtime = browser.runtime;
Vue.prototype.$arrayCopy = arr => JSON.parse(JSON.stringify(arr));
Vue.prototype.$bus = new Vue();

new Vue({ render: h => h(App) }).$mount('#app');
