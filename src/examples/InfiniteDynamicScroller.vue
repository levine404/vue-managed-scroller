<template>
  <div id="infinite-dynamic-scroller">
    <div class="options" style="flex: 0 0 320px;">
      <b-field>
        <b-checkbox v-model="isInfinite">Infinite</b-checkbox>
      </b-field>
      <b-field label="Fake API delay (in seconds)">
        <b-numberinput v-model="fakeApiDelay"></b-numberinput>
      </b-field>
      <b-field label="Scroll To Index">
        <b-input v-model="scrollToIndex"></b-input>
      </b-field>
      <b-button @click="scroll">Scroll</b-button>
    </div>
    <ManagedScroller
      :items="items"
      :buffer="1200"
      :style="{
        'scroll-behavior': 'smooth'
      }"
      ref="managed-scroller"
      @endReached="endReachedHandler"
    >
      <template v-slot="{ item, itemIndex, isVisible, updateShellSize }">
        <ManagedScrollerShell
          static
          :size="40"
        >
          <div
            :style="{
              position: isVisible
                ? 'sticky'
                : 'relative'
            }"
            style="top: 0; left: 0; z-index: 10; pointer-events: none; user-select: none;"
          >
            <div style="display: inline-block; text-align: center; padding: 4px; min-width: 28px; margin: 8px; margin-left: 24px; background-color: coral; border-radius: 50%; color: #eee; font-size: 0.9em;">
              {{ (itemIndex + 1).toLocaleString() }}
            </div>
            <div style="display: inline-block; background: #f6a98d; padding: 2px 12px; border-radius: 6px; color: #fff; font-size: 12px;">
              The {{ convertor.toWordsOrdinal((itemIndex || 0) + 1).split(' ').map((x) => x.split('').map((c, i) => i === 0 ? c.toUpperCase() : c ).join('')).join(' ') }} Item In The List
            </div>
          </div>
        </ManagedScrollerShell>
        <ManagedScrollerShell :size="400">
          <div v-if="!item" style="position: relative; width: 100%; height: 400px;">
            <b-loading
              :is-full-page="false"
              :active="true"
            />
          </div>
          <div v-else>
            <div style="text-indent: 48px; margin: 24px; border-bottom: 2px solid #eee; padding-bottom: 24px;">
              {{ item }}
            </div>
            <MountCheck @mounted="updateShellSize" />
          </div>
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
  name: 'InfiniteDynamicScroll',
  components: {
    ManagedScroller,
    ManagedScrollerShell,
    MountCheck: {
      mounted() {
        this.$emit('mounted');
      },
      render: (createElement) => createElement('span', { style: { display: 'none' }})
    }
  },
  data() {
    return {
      convertor,
      items: [],
      fakeApiWaiting: false,
      isInfinite: true,
      fakeApiDelay: 1,
      scrollToIndex: 0,
      loremIpsum: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque ut eleifend urna. Vivamus vel ultricies lacus, sit amet gravida augue. Nulla facilisi. Aliquam at turpis lectus. Aliquam rhoncus at massa eget cursus. Curabitur viverra, ante nec posuere convallis, orci nisl tincidunt mi, id maximus dui urna sit amet est. Curabitur ac dictum ipsum. Proin eros libero, faucibus a tortor in, sollicitudin mollis enim. Sed tempus, lacus vel gravida vehicula, tortor sem tempor ligula, et auctor dui dolor sed purus.  Aliquam quis sem vitae justo ultricies tempus. Praesent eu bibendum magna. Pellentesque eu felis non mauris pellentesque luctus. Phasellus eget sagittis enim, sit amet sodales est. Proin mauris purus, lobortis sit amet ante in, finibus dictum eros. Phasellus ut enim augue. Aliquam ornare augue sed mauris finibus, eget congue nibh dapibus.  Quisque blandit aliquam massa in iaculis. Praesent dapibus purus felis, sit amet porttitor libero porta pretium. Pellentesque tellus lectus, dignissim at facilisis sit amet, sollicitudin ac risus. Cras a ullamcorper ante. Maecenas porttitor massa eget cursus facilisis. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Pellentesque in consectetur augue, a imperdiet orci. Donec sagittis, nulla at euismod rutrum, metus arcu pharetra ipsum, vitae eleifend libero mi sit amet mi. Vivamus vitae lobortis nunc. Maecenas vestibulum interdum lectus, eu rutrum massa ullamcorper vel.  Praesent vitae augue eu quam congue ullamcorper at vel leo. Fusce a eros faucibus justo consequat luctus non at dui. Morbi molestie justo eu ex luctus cursus. Morbi interdum accumsan lectus et scelerisque. Curabitur a hendrerit velit, vitae auctor lectus. Nullam molestie sit amet nulla quis dapibus. Cras commodo eu augue fermentum pharetra.  Proin at molestie arcu. Donec eget laoreet odio, fermentum maximus quam. Suspendisse mollis libero erat, id dignissim turpis ultricies at. Quisque gravida felis blandit imperdiet aliquam. Mauris non tempor tortor. Proin id diam laoreet, semper eros at, dignissim purus. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Curabitur ac pulvinar ligula. Sed tortor purus, fringilla id diam sit amet, pharetra luctus lorem. Nunc hendrerit felis vitae neque sollicitudin, vel mattis nulla ullamcorper. Sed eu scelerisque ipsum. In consequat sollicitudin purus, nec porta magna hendrerit at. Fusce quis odio et leo efficitur pretium ullamcorper at risus. Vestibulum auctor risus enim, sit amet gravida augue pulvinar nec. In pharetra, quam tincidunt semper scelerisque, dolor turpis congue sem, in bibendum felis orci nec diam.`
    };
  },
  methods: {
    createFakeData(length) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const min = this.loremIpsum.length * 0.3;
          const max = this.loremIpsum.length + 1;
          resolve(Array.from({ length })
            .map(() => this.loremIpsum.slice(
              0,
              Math.floor(Math.random() * (max - min)) + min,
            )),
          );
        }, this.fakeApiDelay * 1000);
      });
    },
    async getFakeData(length) {
      if (!this.fakeApiWaiting && this.isInfinite) {
        this.fakeApiWaiting = true;
        this.items.push(...new Array(length));
        const results = await this.createFakeData(length);
        this.items.splice(this.items.length - length, length, ...results);
        this.fakeApiWaiting = false;
      }
    },
    endReachedHandler() {
      this.getFakeData(10);
    },
    scroll() {
      this.$refs['managed-scroller'].scrollTo(this.scrollToIndex);
    }
  }
}
</script>

<style>
#infinite-dynamic-scroller {
  display: flex;
  width: 100%;
  height: 100%;
  overflow: hidden;
}
</style>