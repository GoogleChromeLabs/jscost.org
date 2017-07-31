<template>
  <!--
    TimelineLegend provides a convenience component for displaying numeric
    data with a colorful swatch and title. It is similar to the UI found in the 
    Chrome Developer Tools Timeline/Performance panel. 

    It accepts three props: `value`, `color` and `title` that can be used 
    as follows:

    <timeline-legend
       value="2.34s"
       color="rgb(243, 210, 124)"
       title="Total Scripting"></timeline-legend>

    You are responsible for supplying your own numeric units for values. 
    -->
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
