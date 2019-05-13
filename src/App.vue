<template>
  <div id="app">
    <div class="options">
      <div class="block">
        <b-radio v-model="whichComponent"
          native-value="InfiniteDynamicScroller">
          InfiniteDynamicScroller
        </b-radio>
        <b-radio v-model="whichComponent"
          native-value="StaticScroller">
          StaticScroller
        </b-radio>
      </div>
    </div>
    <component :is="whichComponent" />
  </div>
</template>

<script>
import InfiniteDynamicScroller from '@/examples/InfiniteDynamicScroller.vue';
import StaticScroller from '@/examples/StaticScroller.vue';
export default {
  name: 'app',
  components: {
    InfiniteDynamicScroller,
    StaticScroller
  },
  data() {
    return {
      whichComponent: 'InfiniteDynamicScroller'
    }
  }
}
</script>

<style>
html, body, #app {
  width: 100%;
  height: 100%;
  padding: 0;
  margin: 0;
  overflow: hidden;
}
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  display: flex;
  flex-direction: column;
}
.options {
  background: #eee;
  padding: 12px;
  border-bottom: 1px solid #ccc;
}
</style>
