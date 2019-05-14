import ManagedScroller from '@/components/ManagedScroller.vue';
import ManagedScrollerShell from '@/components/ManagedScrollerShell.vue';

export default {
  install(Vue) {
    Vue.component('managed-scroller-scroll', ManagedScroller);
    Vue.component('managed-scroller-shell', ManagedScrollerShell);
  }
}

export { ManagedScroller, ManagedScrollerShell }
