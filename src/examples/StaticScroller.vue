<template>
  <div id="static-scroller">
    <div class="options" style="flex: 0 0 320px;">
      <div class="block">
        <b-radio v-model="direction"
          native-value="vertical">
          Vertical
        </b-radio>
        <b-radio v-model="direction"
          native-value="horizontal">
          Horizontal
        </b-radio>
        <b-field label="Number of Items">
          <b-numberinput v-model="numItems"></b-numberinput>
        </b-field>
        <b-field label="Shell Size">
          <b-numberinput v-model="shellSize"></b-numberinput>
        </b-field>
        <b-field label="Scroll To Index">
          <b-input v-model="scrollToIndex"></b-input>
        </b-field>
        <b-button @click="scroll">Scroll</b-button>
      </div>
    </div>
    <ManagedScroller
      :items="numItems"
      :buffer="400"
      :direction="direction"
      :style="{
        'scroll-behavior': 'smooth'
      }"
      ref="managed-scroller"
      invertMouseWheel
    >
      <template v-slot="{ item, itemIndex }">
        <ManagedScrollerShell
          static
          :size="Math.max(10, shellSize)"
          class="static-item"
        >
          {{ (itemIndex + 1).toLocaleString() }}
        </ManagedScrollerShell>
      </template>
    </ManagedScroller>
  </div>
</template>

<script>
import convertor from 'number-to-words';
import ManagedScroller from '@/components/ManagedScroller.vue';
import ManagedScrollerShell from '@/components/ManagedScrollerShell.vue';
export default {
  name: 'StaticScroller',
  components: {
    ManagedScroller,
    ManagedScrollerShell
  },
  data() {
    return {
      convertor,
      numItems: 1000,
      shellSize: 40,
      direction: 'vertical',
      scrollToIndex: 0
    };
  },
  methods: {
    scroll() {
      this.$refs['managed-scroller'].scrollTo(this.scrollToIndex);
    }
  }
}
</script>

<style>
#static-scroller {
  display: flex;
  width: 100%;
  height: 100%;
}
.static-item {
  padding: 4px;
}
.static-item:nth-child(odd) {
  background: #eee;
}
</style>