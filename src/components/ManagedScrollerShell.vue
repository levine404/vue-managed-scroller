<script>
export default {
  name: 'managed-scroller-shell',
  props: {
    static: {
      type: Boolean,
      default: false
    },
    size: {
      type: Number,
      default: 40
    }
  },
  render() {
    const defaultSlotNodes = this.$scopedSlots.default({});
    if (defaultSlotNodes && defaultSlotNodes.length) {
      return defaultSlotNodes[0];
    } else {
      return null;
    }
  }
}
</script>
