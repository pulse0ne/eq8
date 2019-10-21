import Vue from 'vue';
import Popup from './Popup.vue';

Vue.config.devtools = false;
Vue.config.productionTip = false;
Vue.prototype.$noOp = () => {};
Vue.prototype.$runtime = browser.runtime;
Vue.prototype.$arrayCopy = arr => JSON.parse(JSON.stringify(arr));

new Vue({ render: h => h(Popup) }).$mount('#app');
