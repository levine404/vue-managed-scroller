<script>
import Vue from 'vue';
import { isNumber, isString, sum } from 'lodash';
export default {
  name: 'managed-scroller',
  props: {
    items: {
      type: [Array, Number],
      default: 0
    },
    width: {
      type: [String, Number],
      default: '100%'
    },
    height: {
      type: [String, Number],
      default: '100%'
    },
    direction: {
      type: String,
      default: 'vertical'
    },
    buffer: {
      type: [String, Number],
      default: 0
    },
    invertMouseWheel: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      scrollPos: 0,
      elWidth: 0,
      elHeight: 0,
      managedShellSizes: {},
      resizeObserver: null
    };
  },
  computed: {
    iterableItems() {
      return isNumber(this.items)
        ? Array.from({ length: this.items }).map((x, index) => index)
        : this.items;
    }
  },
  mounted() {
    // Update element size
    this._updateElSize();
    if (ResizeObserver) {
      this.resizeObserver = new ResizeObserver(() => {
        this.resize();
      });
      this.resizeObserver.observe(this.$el);
    // Observe bounds if intersection observer is available
    } else if (IntersectionObserver) {
      this.resizeObserver = new IntersectionObserver(() => {
        this.resize();
        // Rerun resize handler in the event of fast resizes
        // (will not recalculate managedShellSizes if dimensions are the same)
        setTimeout(this.resize, 300);
      });
      this.resizeObserver.observe(this.$refs['bottom-inner-bounds']);
      this.resizeObserver.observe(this.$refs['bottom-outter-bounds']);
      this.resizeObserver.observe(this.$refs['right-inner-bounds']);
      this.resizeObserver.observe(this.$refs['right-outter-bounds']);
    } else {
      this.resizeObserver = addEventListener('resize', this.resizeObserver);
    }
  },
  destroyed() {
    if ((ResizeObserver || IntersectionObserver) && this.resizeObserver) {
      this.resizeObserver.disconnect();
    } else if (this.resizeObserver) {
      removeEventListener('resize', this.resizeObserver);
    }
  },
  methods: {
    scrollTo(shellIndex) {
      const defaultShellSizes = this._getDefaultShellSizes();
      let cHeight = 0;
      for (let i = 0; i < shellIndex; i++) {
        cHeight += sum(this.managedShellSizes[i] || defaultShellSizes);
      }
      this.$el[this.direction === 'vertical' ? 'scrollTop' : 'scrollLeft'] = cHeight;
    },
    _updateElSize() {
      this.elWidth = this.$el.offsetWidth;
      this.elHeight = this.$el.offsetHeight;
    },
    resize() {
      const currentElWidth = this.elWidth * 1;
      const currentElHeight = this.elHeight * 1;
      this._updateElSize();
      if (currentElWidth !== this.elWidth || currentElHeight !== this.elHeight) {
        Object.keys(this.managedShellSizes).forEach((key) => {
          this.updateShellSize(Number(key));
        });
      }
    },
    updateShellSize(shellIndex) {
      // Get dynamic wrappers
      const dynamicWrappers = this.$refs[shellIndex];
      if (dynamicWrappers) {
        const newShellSize = this._getDefaultShellSizes();
        // Update dynamic wrapper sizes by overwritting defaults
        dynamicWrappers.forEach((el) => {
          newShellSize[el.dataset.i] = this.direction === 'vertical'
            ? el.offsetHeight
            : el.offsetWidth;
        });
        if (!this.managedShellSizes[shellIndex]) {
          Vue.set(this.managedShellSizes, shellIndex, newShellSize);
        } else {
          this.managedShellSizes[shellIndex] = newShellSize;
        }
      }
    },
    _scrollHandler() {
      // Limit calls via request animation frame if available
      if (requestAnimationFrame) {
        requestAnimationFrame(this._udpateScrollPos);
      } else {
        this._udpateScrollPos();
      }
      requestAnimationFrame(() => {
        // Update scroll position
        this.scrollPos = this.direction === 'vertical'
          ? this.$el.scrollTop
          : this.$el.scrollLeft;
      });
    },
    _udpateScrollPos() {
      this.scrollPos = this.direction === 'vertical'
        ? this.$el.scrollTop
        : this.$el.scrollLeft;
    },
    _mouseWheelHandler(event) {
      if (this.direction === 'horizontal' && this.invertMouseWheel) {
        this.$el.scrollLeft = this.$el.scrollLeft + (Math.sign(event.deltaY) * this.$el.offsetWidth / 7);
      }
    },
    _getDefaultShellSizes() {
      return (this.$scopedSlots.default({}) || [])
        .filter((vNode) =>
          vNode.componentOptions && vNode.componentOptions.tag === 'ManagedScrollerShell')
        .map((ManagedScrollerShell) => ManagedScrollerShell.componentOptions.propsData.size || 0);
    }
  },
  render(createElement) {
    const vNodes = [];
    const dimension = this.direction === 'vertical'
      ? 'height'
      : 'width';
    let cHeight = 0;
    // Check that a height and width has been set (post mount of main wrapper)
    if (this.elWidth !== null && this.elHeight !== null) {
      const elSize = (this.direction === 'vertical'
          ? this.elHeight || 0
          : this.elWidth || 0);
      const bufferSize = isString(this.buffer) && this.buffer.includes('%')
        ? (Number(this.buffer.replace('%', '')) / 100) * elSize
        : this.buffer || 0;
      const topEdge = Math.max(0, this.scrollPos - bufferSize);
      const bottomEdge = this.scrollPos + elSize + bufferSize;
      const shellsToRender = [];
      const defaultShellSizes = this._getDefaultShellSizes();
      let preUnrenderedSize = 0;
      let postUnrenderedSize = 0;
      // Loop through items
      for (let i = 0; i < this.iterableItems.length; i++) {
        // Get item managed size
        const shellSizes = this.managedShellSizes[i] || defaultShellSizes;
        const totalShellSize = sum(shellSizes);
        let isVisible = false;
        // Check if item is in preUnrenderedArea
        if ((cHeight + totalShellSize) < topEdge) {
          preUnrenderedSize += totalShellSize;
        // Check if item is in postUnrenderedArea
        } else if (cHeight >= bottomEdge) {
          postUnrenderedSize += totalShellSize;
        // Item is to be rendered
        } else {
          // Check if item is visible
          const totalHeight = cHeight + totalShellSize;
          const bottom = this.scrollPos + elSize;
          if (
            (cHeight >= this.scrollPos && cHeight <= bottom) ||
            (totalHeight >= this.scrollPos && totalHeight <= bottom)
          ) {
            isVisible = true;
          }
          // Get vnodes from default slot
          const defaultSlotNodes = this.$scopedSlots.default({
            item: this.iterableItems[i],
            itemIndex: i,
            isVisible,
            updateShellSize: this.updateShellSize.bind(this, i),
            resize: this._updateElSize
          });
          if (defaultSlotNodes) {
            // Get the mananged scroll shells from the defaultSlotNodes
            const managedScrollerShells = defaultSlotNodes.filter((vNode) => {
              return vNode.componentOptions && vNode.componentOptions.tag === 'ManagedScrollerShell';
            });
            // Loop through managedScrollerShells and render them directly if static or wrapped to manage dynamic size
            managedScrollerShells.forEach((ManagedScrollerShell, managedScrollShellIndex) => {
              // Check if ManagedScrollerShell is static
              if (
                ManagedScrollerShell.componentOptions &&
                ManagedScrollerShell.componentOptions.propsData &&
                ManagedScrollerShell.componentOptions.propsData.hasOwnProperty('static')
              ) {
                // Render static shell
                // Set static shell key
                ManagedScrollerShell.data.key = `__${i}__${managedScrollShellIndex}`;
                ManagedScrollerShell.key = `__${i}__${managedScrollShellIndex}`;
                ManagedScrollerShell.data.class = [
                  ...(ManagedScrollerShell.data.class || []), 'managed-scroller-shell'
                ];
                // Change static shell context
                ManagedScrollerShell.context = this;
                // Add style to maintain static shell height
                ManagedScrollerShell.data.style = {
                  ...ManagedScrollerShell.data.style || {},
                  [dimension]: shellSizes[managedScrollShellIndex] +
                    (isNumber(shellSizes[managedScrollShellIndex]) ? 'px' : '')
                };
                // Adjust children if root vNode is not an element
                if (ManagedScrollerShell.componentOptions && ManagedScrollerShell.componentOptions.children) {
                  // Check if root vNode is just text
                  if (
                    ManagedScrollerShell.componentOptions.children[0] &&
                    !ManagedScrollerShell.componentOptions.children[0].tag
                  ) {
                    // Wrap children in a new layer
                    ManagedScrollerShell.componentOptions.children = [createElement(
                      'div',
                      [ManagedScrollerShell.componentOptions.children],
                    )];
                  }
                }
                // Render static shell
                shellsToRender.push(ManagedScrollerShell);
              } else {
                // Render dynamic shell (with wrappering elements)
                const dynnamicShell = createElement(
                  'div',
                  {
                    class: 'managed-scroller-shell',
                    style: {
                      [dimension]: shellSizes[managedScrollShellIndex] +
                        (isNumber(shellSizes[managedScrollShellIndex]) ? 'px' : '')
                    },
                    key: `__${i}__${managedScrollShellIndex}`
                  },
                  [
                    createElement(
                      'div',
                      {
                        attrs: {
                          'data-i': managedScrollShellIndex
                        },
                        style: {
                          [dimension === 'width' ? 'height' : 'width']: '100%'
                        },
                        class: 'dynamic-shell-wrapper',
                        ref: String(i),
                        refInFor: true
                      },
                      [ManagedScrollerShell],
                    )
                  ]);
                // Add shell to render list
                shellsToRender.push(dynnamicShell);
              }
            });
          }
        }
        cHeight += totalShellSize;
      }
      // Get buffer size
      // Create preUnrenderedArea
      if (preUnrenderedSize) {
        const preUnrenderedArea = createElement(
          'div',
          {
            class: ['unrendered-area', 'managed-scroller-shell'],
            style: {
              [dimension]: preUnrenderedSize + 'px'
            }
          },
        );
        vNodes.push(preUnrenderedArea);
      } else {
        this.$emit('startReached');
      }
      // Render shells
      vNodes.push(...shellsToRender);
      // Create postUnrenderedArea
      if (postUnrenderedSize) {
        const postUnrenderedArea = createElement(
          'div',
          {
            class: ['unrendered-area', 'managed-scroller-shell'],
            style: {
              [dimension]: postUnrenderedSize + 'px'
            }
          }
        );
        vNodes.push(postUnrenderedArea);
      } else {
        this.$emit('endReached');
      }
    }
    // Create wrapper to go within rootElement
    const managedScrollerWrapper = createElement(
      'div',
      {
        class: 'managed-scroller-wrapper',
        style: {
          [dimension]: cHeight + 'px'
        }
      },
      [vNodes]
    );
    const rootNodes = [managedScrollerWrapper];
    if (!ResizeObserver && IntersectionObserver) {
      // Create top bounds for intersection observation
      const bottomInnerBounds = createElement(
        'div',
        {
          key: 'bottom-inner-bounds',
          ref: 'bottom-inner-bounds',
          class: 'bounds',
          style: {
            top: ((this.elHeight || 0) - 11) + 'px',
            left: 0,
            width: '100%',
            height: '1px'
          }
        }
      );
      // Create bottom outter bounds for intersection observation
      const bottomOutterBounds = createElement(
        'div',
        {
          key: 'bottom-outter-bounds',
          ref: 'bottom-outter-bounds',
          class: 'bounds',
          style: {
            top: ((this.elHeight || 0) + 1) + 'px',
            left: 0,
            width: '100%',
            height: '1px'
          }
        }
      );
      // Create right inner bounds for intersection observation
      const rightInnerBounds = createElement(
        'div',
        {
          key: 'right-inner-bounds',
          ref: 'right-inner-bounds',
          class: 'bounds',
          style: {
            top: 0,
            left: ((this.elWidth || 0) - 11) + 'px',
            width: '1px',
            height: '100%'
          }
        }
      );
      // Create right outter bounds for intersection observation
      const rightOutterBounds = createElement(
        'div',
        {
          key: 'right-outter-bounds',
          ref: 'right-outter-bounds',
          class: 'bounds',
          style: {
            top: 0,
            left: ((this.elWidth || 0) + 1) + 'px',
            width: '1px',
            height: '100%'
          }
        }
      );
      rootNodes.push(bottomInnerBounds, bottomOutterBounds, rightInnerBounds, rightOutterBounds);
    }
    // Create root element
    const rootElement = createElement(
      'div',
      {
        class: ['managed-scroller', this.direction],
        style: {
          width: this.width + (isNumber(this.width) ? 'px' : ''),
          height: this.height + (isNumber(this.height) ? 'px' : '')
        },
        on: {
          scroll: this._scrollHandler,
          mousewheel: this._mouseWheelHandler
        }
      },
      rootNodes
    );
    return rootElement;
  }
}
</script>

<style>
.managed-scroller .managed-scroller-wrapper {
  position: relative;
  display: flex;
}
.managed-scroller .managed-scroller-wrapper .managed-scroller-shell {
  position: relative;
  box-sizing: border-box;
  display: block;
}
.managed-scroller .managed-scroller-wrapper .managed-scroller-shell .dynamic-shell-wrapper {
  position: absolute;
  top: 0;
  left: 0;
}
.managed-scroller.vertical {
  overflow-y: scroll;
}
.managed-scroller.horizontal {
  overflow-x: scroll;
}
.managed-scroller.vertical .managed-scroller-wrapper {
  flex-direction: column;
}
.managed-scroller.horizontal .managed-scroller-wrapper {
  flex-direction: row;
  flex-wrap: nowrap;
}
.managed-scroller.horizontal .managed-scroller-shell {
  height: 100%;
}
.managed-scroller.vertical .managed-scroller-wrapper {
  width: 100%;
}
.managed-scroller.horizontal .managed-scroller-wrapper {
  height: 100%;
}
.managed-scroller.managed-scroller-shell {
  overflow: hidden;
}
.managed-scroller .bounds {
  position: absolute;
  pointer-events: none;
  opacity: 0;
}
</style>