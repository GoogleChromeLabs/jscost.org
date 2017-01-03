<template>
  <div>
    <span class='timeline-aggregated-legend-value'>{{value}}</span>
    <span class='timeline-aggregated-legend-swatch' :style='getBackgroundColor'></span>
    <span class='timeline-aggregated-legend-title'>{{title}}</span>
  </div>
</template>
<script>
export default {
  props: ['value', 'color', 'title'],
  data () {
    return {

    }
  },
  computed: {
    getBackgroundColor () {
      return 'background-color: ' + this.color
    }
  }
}
</script>
<style scoped>

</style>
