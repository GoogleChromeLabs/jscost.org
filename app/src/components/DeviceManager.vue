<!--
TODO: What is the cost of inline x(y(item)) vs. foo(item) where the method does x(y(item)) for you.
TODO: Start breaking things up into components
-->
<template>
  <div class='container vertical around-justified layout' v-bind:class="{ hasCustomTrace: hasCustomTrace }">

    <my-controls
      v-on:selected='reportTraceContent'
      v-on:bundlesizechange='bundleSizeChanged'
      v-on:networkchange='networkSpeedChanged'
      v-on:ttichange= 'ttiChanged'
    ></my-controls>

    <template v-if="isCustomTraceSupplied()">
      <p>Your trace spends ~{{formatOutput(getCustomTraceTotalScriptingTime())}} in JavaScript. Parse ({{formatOutput(getCustomTraceValueFor('Compile Script'))}}).
      Eval ({{formatOutput(getCustomTraceValueFor('Evaluate Script'))}}).</p>
    </template>


    <div class='device-manager horizontal layout wrap'>
      <div v-for='item in devices' class='device-entry-container'>
        <div class='device-entry'>
          <div><strong><span>{{item.name}}</span></strong></div>
          <div><img :src='item.image'/></div>

          <!-- Template for synthetic benchmark -->
          <template v-if="traceStats.get('JS Frame') === undefined">
            <div class='details'>

              <timeline-legend
                :value="formatOutput(computeSum(item))"
                color="rgb(243, 210, 124)"
                title="Total Scripting"></timeline-legend>

              <timeline-legend
                :value="formatOutput(computeValue('parse', item))"
                color="rgb(144, 194, 133)"
                title="Parse"></timeline-legend>

              <timeline-legend
                :value="formatOutput(computeValue('eval',item))"
                color="rgb(144, 183, 234)"
                title="Evaluate"></timeline-legend>

              <div v-bind:class="{ 'over-budget': isBenchmarkOverTTIBudget(item) }">
                <span class='timeline-aggregated-legend-value'>{{formatOutput(computeTTIRemainder(item))}}</span>
                <span class='timeline-aggregated-legend-swatch' style='background-color: rgb(222, 222, 222);'></span>
                <span class='timeline-aggregated-legend-title'>TTI budget remaining</span>
              </div>
            </div>

            <progress :max='timeToInteractiveBudget' :value='computeTimeSum(item)'>
            </progress>
          </template>
          <!-- A user supplied trace will toggle the more detailed view -->
          <template v-else-if="isCustomTraceSupplied()">
            <div class='details'>

              <timeline-legend
                :value="formatOutput(getCustomTraceDeviceTotalScriptingTime(item))"
                color="rgb(243, 210, 124)"
                title="Total Scripting"></timeline-legend>

              <timeline-legend
                :value="formatOutput(getCustomTraceEstimateForDeviceProp(item, 'JS Frame'))"
                color="#EFB320"
                title="JS Frame"></timeline-legend>

              <timeline-legend
                :value="formatOutput(getCustomTraceEstimateForDeviceProp(item, 'Compile Script'))"
                color="rgb(144, 194, 133)"
                title="Parse"></timeline-legend>

              <timeline-legend
                :value="formatOutput(getCustomTraceEstimateForDeviceProp(item, 'Evaluate Script'))"
                color="rgb(144, 183, 234)"
                title="Evaluate"></timeline-legend>

              <timeline-legend
                :value="formatOutput(getCustomTraceEstimateForDeviceProp(item, 'Major GC'))"
                color="#FAEAC2"
                title="Major CC"></timeline-legend>

              <timeline-legend
                :value="formatOutput(getCustomTraceEstimateForDeviceProp(item, 'Minor GC'))"
                color="#FAEAC2"
                title="Minor CC"></timeline-legend>

              <timeline-legend
                :value="formatOutput(getCustomTraceEstimateForDeviceProp(item, 'Run Microtasks'))"
                color="#AAAAAA"
                title="Microtasks"></timeline-legend>

              <timeline-legend
                :value="formatOutput(getCustomTraceParseHTMLCSSTime(item))"
                color="#A4C4ED"
                title="Parse HTML/CSS"></timeline-legend>

              <timeline-legend
                :value="formatOutput(getCustomTraceEstimatedNetworkTransferTime())"
                color="#90B7EA"
                title="Load (emulated)"></timeline-legend>

              <!--
              <div>
                <span class='timeline-aggregated-legend-value'>{{customTraceDOMCompleteTime}}ms</span>
                <span class='timeline-aggregated-legend-swatch' style='background-color: #AAAAAA;'></span>
                <span class='timeline-aggregated-legend-title'>DOM Complete</span>
              </div>
              -->
              <!--
              <div>
                <span class='timeline-aggregated-legend-value'>{{customTraceLoadingTime}}ms</span>
                <span class='timeline-aggregated-legend-swatch' style='background-color: #90B7EA'></span>
                <span class='timeline-aggregated-legend-title'>Load (original trace)</span>
              </div>
              -->
              <div v-bind:class="{ 'over-budget': isCustomTraceOverTTIBudget(item) }">
                <span class='timeline-aggregated-legend-value'>{{formatOutput(getCustomTraceEstimatedTTIRemaining(item))}}</span>
                <span class='timeline-aggregated-legend-swatch' style='background-color: #CCDEF5'></span>
                <span class='timeline-aggregated-legend-title'>TTI budget remaining</span>
              </div>

            </div>
            <progress :max='timeToInteractiveBudget' :value='getCustomTraceSumOfTimeSpent(item)'>
            </progress>
          </template>


        </div>
      </div>

</template>

<script>
import deviceConfig from './Devices.js'
import networkConditions from './Network.js'
import controls from './Controls.vue'
import timelineLegend from './TimelineLegend.vue'
import * as TimelineFilters from './TimelineFilters.js'

export default {
  name: 'jscost',
  components: {
    'my-controls': controls,
    'timeline-legend': timelineLegend
  },
  data () {
    return {
      /* -- Budgets -- */
      /* All synthetic benchmark timings are based on time to run 1048KB of 'average' JS */
      baseSize: 1048,
      /* Default JS bundle size target for the synthetic benchmark */
      bundleSizeBudget: 1200,
      /* Target time the app should be interactive in. Chrome suggests < 5000ms */
      timeToInteractiveBudget: 5000,
      /* Scripting budget (Parse/Eval primarily) */
      scriptingBudget: 3500,
      /* -- Network -- */
      /* Most developers are testing on desktop with a fast connection. */
      /* Default to DevTools Wifi configuration that most traces will likely be based on */
      downloadSpeed: 30000,
      devices: deviceConfig,
      network: networkConditions,
      networkSelected: '30000',
      /* -- Custom traces -- */
      /* Only truthy when a valid custom trace was supplied */
      hasCustomTrace: false,
      /* If a custom trace is selected, store the trace stats */
      traceStats: new Map(),
      /* Load stats calculated from the custom trace */
      customTraceDOMCompleteTime: 0,
      customTraceDOMInteractiveTime: 0,
      customTraceLoadingTime: 0

    }
  },
  methods: {
    isCustomTraceOverTTIBudget (item) {
      return (this.getCustomTraceEstimatedTTIRemaining(item) < -1)
    },

    isBenchmarkOverTTIBudget (item) {
      return (this.computeTTIRemainder(item) < -1)
    },

    // <my-controls>
    networkSpeedChanged (speed) {
      this.downloadSpeed = speed
    },

    ttiChanged (tti) {
      this.timeToInteractiveBudget = tti
    },

    bundleSizeChanged (bundleSize) {
      this.bundleSizeBudget = bundleSize
    },
    // </my-controls>

    /*
      Compute the total time spent in script across JS Frame (CPU), Compile, Eval,
      Minor and Major GC events.
    */
    getCustomTraceDeviceTotalScriptingTime (item) {
      var JSFrame = this.getCustomTraceEstimateForDeviceProp(item, 'JS Frame')
      var CompileScript = this.getCustomTraceEstimateForDeviceProp(item, 'Compile Script')
      var EvaluateScript = this.getCustomTraceEstimateForDeviceProp(item, 'Evaluate Script')
      var MajorGC = this.getCustomTraceEstimateForDeviceProp(item, 'Major GC')
      var MinorGC = this.getCustomTraceEstimateForDeviceProp(item, 'Minor GC')
      return JSFrame + CompileScript + EvaluateScript + MajorGC + MinorGC
    },

    getCustomTraceTotalScriptingTime () {
      var JSFrame = this.getCustomTraceValueFor('JS Frame')
      var CompileScript = this.getCustomTraceValueFor('Compile Script')
      var EvaluateScript = this.getCustomTraceValueFor('Evaluate Script')
      var MajorGC = this.getCustomTraceValueFor('Major GC')
      var MinorGC = this.getCustomTraceValueFor('Minor GC')
      return JSFrame + CompileScript + EvaluateScript + MajorGC + MinorGC
    },

    getCustomTraceParseHTMLCSSTime () {
      var traceParseHTML = parseInt(this.traceStats.get('Parse HTML'), 10)
      var traceParseCSS = parseInt(this.traceStats.get('Parse Stylesheet'), 10)
      return (traceParseHTML + traceParseCSS).toFixed(0)
    },

    getCustomTraceValueFor (key) {
      return parseInt(this.traceStats.get(key), 10)
    },

    // ONLY use this for timings that are JS-related (e.g Parse)
    getCustomTraceEstimateForDeviceProp (item, key) {
      // Assume the trace was taken on a high-end desktop, like an MBP
      // Let's first calculate how much time the default benchmark spends
      // in script for that device. We'll use this as a relative weight.
      var totalScriptingBaseline = deviceConfig[0].parse + deviceConfig[0].eval
      // Next, what's the total time in script for the current device?
      var totalScriptingForDevice = item.parse + item.eval
      // Calculate multiplier relative to the mbp scores as they're the same app
      var multiplier = (parseInt(this.traceStats.get(key), 10) / totalScriptingBaseline).toFixed(2)
      // Adjust device stats and trace stats based on this multiplier
      return Math.floor(totalScriptingForDevice * multiplier)
    },

    calculateTransferRate (fileSizeMB, transferRateMbps) {
      // http://superuser.com/questions/360959/is-there-a-easy-way-to-calculate-time-for-data-transfer
      return ((8000 * fileSizeMB) / transferRateMbps)
    },

    getCustomTraceEstimatedTTIRemaining (item) {
      return Math.floor(this.timeToInteractiveBudget - this.getCustomTraceSumOfTimeSpent(item)).toFixed(0)
    },

    getCustomTraceEstimatedNetworkTransferTime () {
      return this.calculateTransferRate(this.bundleSizeBudget / 1000, this.downloadSpeed / 1000)
    },

    getCustomTraceSumOfTimeSpent (item) {
      return Math.floor(this.getCustomTraceEstimatedNetworkTransferTime() + this.getCustomTraceDeviceTotalScriptingTime(item)).toFixed(0)
    },

    computeSum (item) {
      return Math.floor(item.parse * (this.bundleSizeBudget / this.baseSize)) + Math.floor(item.eval * (this.bundleSizeBudget / this.baseSize))
    },

    computeValue (field, item) {
      return Math.floor(item[field] * (this.bundleSizeBudget / this.baseSize))
    },

    computeTimeSum (item) {
      return Math.floor(((((Math.floor(this.bundleSizeBudget * 0.25)) * 8) / this.downloadSpeed) * 1000) + Math.floor(item.parse * (this.bundleSizeBudget / this.baseSize)) + Math.floor(item.eval * (this.bundleSizeBudget / this.baseSize)))
    },

    computeTTIRemainder (item) {
      return Math.floor(this.timeToInteractiveBudget - (((((Math.floor(this.bundleSizeBudget * 0.25)) * 8) / this.downloadSpeed) * 1000).toFixed(0)) - Math.floor(item.parse * (this.bundleSizeBudget / this.baseSize)) - Math.floor(item.eval * (this.bundleSizeBudget / this.baseSize))).toFixed(0)
    },

    isCustomTraceSupplied () {
      return this.traceStats.get('JS Frame') > 0
    },

    formatOutput (str) {
      // Take an input ms-based integer and return a formatted second string
      return (str / 1000).toFixed(2) + 's'
    },

    reportTraceContent (trace, filename) {
      require(['devtools-timeline-model-browser'], (d) => {
        var model = new window.TimelineModelBrowser(trace)
        var bottomUpByName = model.bottomUpGroupBy('EventName')
        var tree = this.dumpTree(bottomUpByName, 'selfTime')
        // this.traceTotalTime = model.topDown().totalTime
        // Bottom up tree grouped by EventName
        this.traceStats = tree['_c']

        // Compute loading durations
        var events = model.timelineModel().mainThreadEvents()
        var domLoading = events.filter(TimelineFilters._filterEventsForDomLoading)
        var domComplete = events.filter(TimelineFilters._filterEventsForDomComplete)
        var domInteractive = events.filter(TimelineFilters._filterEventsForDomInteractive)
        var navStart = events.filter(TimelineFilters._filterEventsForNavStart)
        var loadEventEnd = events.filter(TimelineFilters._filterEventsForLoadEventEnd)

        this.customTraceDOMCompleteTime = Math.floor(domComplete[0].startTime - domLoading[0].startTime)
        this.customTraceDOMInteractiveTime = Math.floor(domInteractive[0].startTime - domLoading[0].startTime)
        this.customTraceLoadingTime = Math.floor(loadEventEnd[0].startTime - navStart[0].startTime)

        this.bundleSizeBudget = (this.customTraceLoadingTime / 80) * 300

        // Finally hint to UI that a custom trace was supplied
        this.hasCustomTrace = true
      })
    },
    dumpTree (tree, timeValue) {
      var result = new Map()
      tree.children.forEach((value, key) => result.set(key, value[timeValue].toFixed(1)))
      return result
    }
  }
}
</script>

<!-- Add 'scoped' attribute to limit CSS to this component only -->
<style scoped>
@import url('./DeviceManager-FlexHelpers.css');
@import url('./DeviceManager-Skeleton.css');

.device-manager {
  padding: 10px;
  display: flex;
}

.device-entry {
  height: 240px;
  padding: 10px;
  text-align: center;
  display: block;
}

.hasCustomTrace .device-entry {
  height: 400px;
}

.hasCustomTrace .js-bundle-size, .hasCustomTrace .gzip-preview {
  display: none;
}

.device-entry img {
  width: 140px;
  margin-top: 10px;
}

label {
  font-weight: 700;
}

.details {
  text-align: left;
}

.over-budget {
  background-color: rgb(255, 215, 215);
}

/* Mobile styles */
@media (max-width: 1250px) {
  /* */
}

@media (max-width: 450px) {
  .device-entry-container {
    margin: 0 auto;
  }
}
</style>
