import HelloWorld from '@/components/HelloWorld';

export default {
  install(Vue) {
    Vue.component('hello-world', HelloWorld);
  }
}

export { HelloWorld }
