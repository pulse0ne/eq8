import Vue from 'vue';
import Options from './Options.vue';

Vue.config.devtools = false;
Vue.config.productionTip = false;
Vue.prototype.$runtime = browser.runtime;

new Vue({ render: h => h(Options) }).$mount('#app');
