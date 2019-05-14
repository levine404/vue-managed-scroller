import VirtualScroll from '@/components/VirtualScroll.vue';
import VirtualScrollShell from '@/components/VirtualScrollShell.vue';

export default {
  install(Vue) {
    Vue.component('virtual-scroll', VirtualScroll);
    Vue.component('virtual-scroll-shell', VirtualScrollShell);
  }
}

export { VirtualScroll, VirtualScrollShell }
