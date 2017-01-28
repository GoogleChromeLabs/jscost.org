<template>
  <!--
    DeviceManager provides a synthetic benchmark using a baseline cost for 1048KB of "average"
    JavaScript Parse/Eval across different devices (Devices.js). The test used to gather the
    data for this baseline is at https://jscost.org/device-test.html. Each time a device hits
    this URL, we record the cost of Parse and Eval using Google Analytics, which allows us to drill
    down to the Mobile Device Model. All data is recorded from real-devices using the default browser
    available (e.g a Pixel will use Chrome, iPhones use Safari) unless otherwise noted. Data is 
    also based on the median of samples available for each device.
    
    By default, we present the parse/eval costs for each of these devices when you visit JSCost. A user can 
    modify the bundle size, network speed or time-to-interactive budget to see how these may impact
    the benchmark on these different devices. This is done using a series of multipiers. If the Parse cost
    on a Nexus 5X is N for MKB of script, for a target bundle size of PKB, parse cost is N * (P/M). 
    
    You are also able to select a custom (desktop) trace which attempts to estimate your performance 
    on these real-world device numbers relative to the synthetic benchmark. A custom trace *must* be
    recorded on a desktop device using a strong/WiFi connection. A custom trace provides us with full
    details on Parse/Eval/FunctionCall/GC time. For each of these values, we first look at what their values
    would be relative to the synthetic benchmarks Parse/Eval scores for like-for-like hardware (a MBP).
    We then use a similar model as described earlier to estimate performance on each device. Accuracy is
    impacted by lack of DevTools traces providing JS bundle sizes (we have asked for this). 
    
    JSCost is strictly an estimation tool and does not claim to be a replacement for real-world device 
    testing. Instead use it as a hundred-foot view of what device perf for scripting could be.

    Assumptions made:

    JS bundle-size can impact scripting time 
    ----------------------------------------------------------------

    We make a correlation by default that the size of a JavaScript bundle can 
    have a linear impact on the Parse/Eval time for a page and thus impact overall time spent 
    in script. A user can play with their bundle size to see how this can push out their time 
    to being interactive on different devices. It's acknowledged that real-world code can vary
    wildly in this regard (e.g 300KB of script in app A may exhibit higher costs than B) so we
    stress that as much as possible, insights are backed by real-world testing.

    It is possible to (loosely) estimate the gzipped-size of a JS bundle 
    --------------------------------------------------------------------

    Modern JS code is likely to be served using gzip compression. As this benchmark is synthetic, it's
    we can at best try to 'guess' what average gzip compression might save you. We use Stoyan Stefanov's
    estimation of gzip saving you 70% in our computations, both for the synth benchmark and when trying 
    to use your own custom traces. As DevTools Timeline traces do not (at the time of writing) expose the
    size of scripts, estimations are all we can really offer here.

    It is possible to (loosely) estimate the transfer time of a JS bundle 
    ----------------------------------------------------------------------

    We estimate transfer time by dividing the bundle size (in GB) by the est. IP/TCP overhead 
    and then divide it by the speed of our connection in MB per/second based on the numbers from
    Network.js (dervived from the Chrome DevTools network emulation feature). Calculations do not
    presently account for other factors such as network spotiness or latency. If you have a better
    way to estimate transfer time, please do let us know!.


    Could look at different types of sites/apps using same approach.


    -->
  <div class='container vertical around-justified layout' v-bind:class="{ hasCustomTrace: hasCustomTrace }">

    <toolbar-controls
      @traceSelected='reportTraceContent'
      @bundlesizeChanged='bundleSizeChanged'
      @networkChanged='networkSpeedChanged'
      @ttiChanged= 'ttiChanged'
      @reset= 'reset'
    ></toolbar-controls>

    <template v-if="hasCustomTrace">
      <p class='estimated-js-message'>Your trace spends ~<strong>{{formatOutput(getCustomTraceTotalScriptingTime())}}</strong> in JavaScript. ({{formatOutput(getCustomTraceValueFor('Compile Script'))}}) on Parse.
      ({{formatOutput(getCustomTraceValueFor('Evaluate Script'))}}) on Eval.</p>
    </template>
    <template v-else>
      <p class='estimated-js-message'><strong>{{this.computeGZippedSize(this.bundleSizeBudget)}}KB</strong> (gzipped) of average JavaScript is estimated to load as follows:</p>
    </template>

    <div class='device-manager horizontal layout wrap'>
      <div v-for='item in devices' class='device-entry-container'>
        <div class='device-entry'>
          <div><strong><span>{{item.name}}</span></strong></div>
          <div><img :src='item.image'/></div>

          <!-- Template for synthetic benchmark -->
          <template v-if="!hasCustomTrace">
            <div class='details'>

              <timeline-legend
                :value="formatOutput(computeSumRelativeToBudget(item))"
                color="rgb(243, 210, 124)"
                title="JavaScript Start-up"></timeline-legend>

              <timeline-legend
                :value="formatOutput(computeValueRelativeToBudget('parse', item))"
                color="rgb(144, 194, 133)"
                title="Parse"></timeline-legend>

              <timeline-legend
                :value="formatOutput(computeValueRelativeToBudget('eval',item))"
                color="rgb(144, 183, 234)"
                title="Evaluate"></timeline-legend>

              <timeline-legend
                :value="formatOutput(getEstimatedNetworkTransferTime())"
                color="#CCDEF5"
                title="Bundle Load Time"></timeline-legend>

              <div v-bind:class="{ 'over-budget': isBenchmarkOverTTIBudget(item) }">
                <span class='timeline-aggregated-legend-value'>{{formatOutput(computeTTIRemainder(item))}}</span>
                <span class='timeline-aggregated-legend-swatch' style='background-color: rgb(222, 222, 222);'></span>
                <span class='timeline-aggregated-legend-title'>Interactive time left:</span>
              </div>
            </div>

            <progress :max='timeToInteractiveBudget' :value='computeTimeSum(item)'>
            </progress>
          </template>
          <!-- A user supplied trace will toggle the more detailed view -->
          <template v-else-if="hasCustomTrace">
            <div class='details'>

              <timeline-legend
                :value="formatOutput(getCustomTraceDeviceTotalScriptingTime(item))"
                color="rgb(243, 210, 124)"
                title="Time in JavaScript"></timeline-legend>

              <timeline-legend
                :value="formatOutput(getCustomTraceEstimateForDeviceProp(item, 'JS Frame'))"
                color="#EFB320"
                title="Function Call"></timeline-legend>

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
                title="Major GC"></timeline-legend>

              <timeline-legend
                :value="formatOutput(getCustomTraceEstimateForDeviceProp(item, 'Minor GC'))"
                color="#FAEAC2"
                title="Minor GC"></timeline-legend>
<!--
              <timeline-legend
                :value="formatOutput(getCustomTraceEstimateForDeviceProp(item, 'Run Microtasks'))"
                color="#AAAAAA"
                title="Microtasks"></timeline-legend>-->

              <timeline-legend
                :value="formatOutput(getCustomTraceParseHTMLCSSTime(item))"
                color="#A4C4ED"
                title="Parse HTML/CSS"></timeline-legend>

              <timeline-legend
                :value="formatOutput(getEstimatedNetworkTransferTime())"
                color="#90B7EA"
                title="Page Load"></timeline-legend>

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
                <span class='timeline-aggregated-legend-title'>TTI budget left:</span>
              </div>

            </div>
            <progress :max='timeToInteractiveBudget' :value='getCustomTraceSumOfTimeSpent(item)'>
            </progress>
          </template>
        </div>
      </div>
</template>

<script>
import config from './Config.js'
import deviceConfig from './Devices.js'
import controls from './ControlsToolbar.vue'
import timelineLegend from './TimelineLegend.vue'
import * as TimelineFilters from './TimelineFilters.js'

function getDefaultData () {
  let defaults = {}
  Object.assign(defaults, config)
  return defaults
}

export default {
  name: 'jscost',
  components: {
    'toolbar-controls': controls,
    'timeline-legend': timelineLegend
  },
  data: getDefaultData,
  methods: {
    isCustomTraceOverTTIBudget (item) {
      return (this.getCustomTraceEstimatedTTIRemaining(item) < -1)
    },

    isBenchmarkOverTTIBudget (item) {
      return (this.computeTTIRemainder(item) < -1)
    },

    // <toolbar-controls>
    networkSpeedChanged (speed) {
      this.downloadSpeed = speed
    },

    ttiChanged (tti) {
      this.timeToInteractiveBudget = tti
    },

    bundleSizeChanged (bundleSize) {
      this.bundleSizeBudget = bundleSize
    },
    // </toolbar-controls>

    /*
      Extract a specific key value from a stored trace
    */
    getCustomTraceValueFor (key) {
      return parseInt(this.traceStats.get(key), 10)
    },
    /*
      Compute the total (estimated) time spent in script across JS Frame (CPU), Compile, Eval,
      Minor and Major GC events for a given item. An item is an entry based on a device entry
      from Devices.js.
    */
    getCustomTraceDeviceTotalScriptingTime (item) {
      const JSFrame = this.getCustomTraceEstimateForDeviceProp(item, 'JS Frame')
      const CompileScript = this.getCustomTraceEstimateForDeviceProp(item, 'Compile Script')
      const EvaluateScript = this.getCustomTraceEstimateForDeviceProp(item, 'Evaluate Script')
      const MajorGC = this.getCustomTraceEstimateForDeviceProp(item, 'Major GC')
      const MinorGC = this.getCustomTraceEstimateForDeviceProp(item, 'Minor GC')
      return JSFrame + CompileScript + EvaluateScript + MajorGC + MinorGC
    },

    /*
      Compute the total time spent in script across JS Frame (CPU), Compile, Eval,
      Minor and Major GC events for a preloaded custom trace. This data is read directly
      from the trace rather than any estimation modelling being performed on the data.

      Trace data is made available to DeviceManager when saveTraceStats() is called via
      this.traceStats.
    */
    getCustomTraceTotalScriptingTime () {
      const JSFrame = this.getCustomTraceValueFor('JS Frame')
      const CompileScript = this.getCustomTraceValueFor('Compile Script')
      const EvaluateScript = this.getCustomTraceValueFor('Evaluate Script')
      const MajorGC = this.getCustomTraceValueFor('Major GC')
      const MinorGC = this.getCustomTraceValueFor('Minor GC')
      return JSFrame + CompileScript + EvaluateScript + MajorGC + MinorGC
    },

    /*
      Compute the total time spent parsing HTML and CSS Stylesheets directly from a trace.
      Returns the sum of `Parse HTML` and `Parse Stylesheet` events.
    */
    getCustomTraceParseHTMLCSSTime () {
      const traceParseHTML = this.getCustomTraceValueFor('Parse HTML')
      const traceParseCSS = this.getCustomTraceValueFor('Parse Stylesheet')
      return (traceParseHTML + traceParseCSS).toFixed(0)
    },

    // ONLY use this for timings that are JS-related (e.g Parse)
    getCustomTraceEstimateForDeviceProp (item, key) {
      // Assume the trace was taken on a high-end desktop, like an MBP
      // Let's first calculate how much time the default benchmark spends
      // in script for that device. We'll use this as a relative weight.
      const totalScriptingBaseline = deviceConfig[0].parse + deviceConfig[0].eval
      // Next, what's the total time in script for the current device?
      const totalScriptingForDevice = item.parse + item.eval
      // Calculate multiplier relative to the mbp scores as they're the same app
      const multiplier = (this.getCustomTraceValueFor(key) / totalScriptingBaseline).toFixed(2)
      // Adjust device stats and trace stats based on this multiplier
      return Math.floor(totalScriptingForDevice * multiplier)
    },

    getCustomTraceEstimatedTTIRemaining (item) {
      return Math.floor(this.timeToInteractiveBudget - this.getCustomTraceSumOfTimeSpent(item)).toFixed(0)
    },

    getEstimatedNetworkTransferTime () {
      return this.calculateTransferTime(this.computeGZippedSize(this.bundleSizeBudget), this.downloadSpeed / 1000)
    },

    getCustomTraceSumOfTimeSpent (item) {
      return Math.floor(this.getEstimatedNetworkTransferTime() + this.getCustomTraceDeviceTotalScriptingTime(item)).toFixed(0)
    },

    computeSumRelativeToBudget (item) {
      return Math.floor(item.parse * (this.bundleSizeBudget / this.baseSize)) + Math.floor(item.eval * (this.bundleSizeBudget / this.baseSize))
    },

    computeValueRelativeToBudget (field, item) {
      return Math.floor(item[field] * (this.bundleSizeBudget / this.baseSize))
    },

    computeTimeSum (item) {
      return Math.floor(this.getEstimatedNetworkTransferTime() + Math.floor(item.parse * (this.bundleSizeBudget / this.baseSize)) + Math.floor(item.eval * (this.bundleSizeBudget / this.baseSize)))
    },

    computeTTIRemainder (item) {
      return Math.floor(this.timeToInteractiveBudget - (((((Math.floor(this.bundleSizeBudget * 0.25)) * 8) / this.downloadSpeed) * 1000).toFixed(0)) - Math.floor(item.parse * (this.bundleSizeBudget / this.baseSize)) - Math.floor(item.eval * (this.bundleSizeBudget / this.baseSize))).toFixed(0)
    },

    /*
      Estimate how long it would take to transfer Nmb using a connection
      with a known transfer rate.
      This will compute total transfer time in seconds.
    */
    calculateTransferTime (fileSizeMB, transferRateMbps) {
      // http://superuser.com/a/361237
      // [1024 Mio/Gio] * [8 Mb/Mio] / 94.92848% ≈ 8630
      return ((8630 * (fileSizeMB / 1000)) / transferRateMbps)
    },

    estimateTracePageSize (loadTimeInSeconds) {
      // 30 = desktop wifi transfer rate. we assume most are desktop traces.
      // return ((30 * loadTimeInSeconds) / 8630) * 1000
      // return ((loadTimeInSeconds * 30) / 8630) / 1000
      return ((30 * loadTimeInSeconds) / 8630) * 1000
      // returns MBs
    },

    computeGZippedSize (uncompressedRequestSize) {
      // This is at best a guess and in real-world situations you would
      // run gzip tools against your bundle for the correct numbers here.
      // We estimate a 70% reduction in filesize if you're gzipping.
      // http://www.phpied.com/reducing-tpayload/
      return Math.floor(uncompressedRequestSize * 0.3)
    },

    isCustomTraceSupplied () {
      return this.traceStats.get('JS Frame') > 0
    },

    formatOutput (str) {
      // Take an input ms-based integer and return a formatted second string
      return (str / 1000).toFixed(2) + 's'
    },

    /* Store a given trace or subset of a modelled trace in-memory for local use */
    storeTraceStats (trace) {
      this.traceStats = trace
    },

    reportTraceContent (trace, filename) {
      require(['devtools-timeline-model-browser'], (d) => {
        const model = new window.TimelineModelBrowser(trace)
        const bottomUpByName = model.bottomUpGroupBy('EventName')
        const tree = this.dumpTree(bottomUpByName, 'selfTime')
        // Bottom up tree grouped by EventName
        this.storeTraceStats(tree['_c'])

        // Compute loading durations
        const events = model.timelineModel().mainThreadEvents()
        const domLoading = events.filter(TimelineFilters._filterEventsForDomLoading)
        const domComplete = events.filter(TimelineFilters._filterEventsForDomComplete)
        const domInteractive = events.filter(TimelineFilters._filterEventsForDomInteractive)
        const domContentLoadedEventEnd = events.filter(TimelineFilters._filterEventsForDomContentLoadedEventEnd)
        const navStart = events.filter(TimelineFilters._filterEventsForNavStart)
        const firstTextPaintEvent = events.filter(TimelineFilters._filterEventsForFirstTextPaint)
        const fetchStart = events.filter(TimelineFilters._filterEventsForFetchStart)
        const loadEventEnd = events.filter(TimelineFilters._filterEventsForLoadEventEnd)

        // let loadEventEnd = events.filter(TimelineFilters._filterEventsForLoadEventEnd)
        this.customTraceDOMCompleteTime = Math.floor(domComplete[0].startTime - domLoading[0].startTime)
        this.customTraceDOMInteractiveTime = Math.floor(domInteractive[0].startTime - domLoading[0].startTime)
        // this.customTraceLoadingTime = Math.floor(loadEventEnd[0].startTime - navStart[0].startTime)
        // window.performance.timing.domContentLoadedEventEnd- window.performance.timing.navigationStart
        this.customTraceLoadingTime = Math.floor(domContentLoadedEventEnd[0].startTime - navStart[0].startTime)
        // new
        this.customTraceSimpleFMP = Math.floor(firstTextPaintEvent[0].startTime - navStart[0].startTime)
        this.customTraceNewLoadTime = Math.floor(loadEventEnd[0].startTime - fetchStart[0].startTime)

        console.info(`DOM Interactive: ${this.customTraceDOMInteractiveTime}ms`)
        console.info(`Loading Time: ${this.customTraceLoadingTime}ms`)
        console.info(`FMP: ${this.customTraceSimpleFMP}ms`)
        console.info(`New Loading Time: ${this.customTraceNewLoadTime}`)

        // Note: for 'Wifi' this should be around 4.2s for theverge.com
        // Important: Traces do NOT currently expose size of their JavaScript.
        // When in custom trace mode, we instead look at transfer time for the
        // overall page. Load time estimations then look at this when calculating
        // how long it will take to transfer.
        // MS -> Seconds * (MB -> KB)
        this.bundleSizeBudget = this.estimateTracePageSize(this.customTraceLoadingTime * 1000)
        // Confirmed: if you know the correct budget size, load time from here will be right.
        console.info(`Estimated page size: ${this.bundleSizeBudget}`)
        console.info(`Estimated transfer time on WiFi ${this.calculateTransferTime(this.bundleSizeBudget / 1000, 30)}`)

        // Finally hint to UI that a custom trace was supplied
        this.hasCustomTrace = true
      })
    },
    dumpTree (tree, timeValue) {
      let result = new Map()
      tree.children.forEach((value, key) => result.set(key, value[timeValue].toFixed(1)))
      return result
    },

    /* 🚿 the world */
    reset () {
      Object.assign(this.$data, getDefaultData())
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
  max-width: 96%;
  margin: 0 auto;
}

.device-entry {
  height: 260px;
  padding: 10px;
  text-align: center;
  display: block;
}

.hasCustomTrace .device-entry {
  height: 360px;
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

.estimated-js-message {
  font-size: 2em;
}

/* Mobile styles */
@media (max-width: 1250px) {
  /* */
}

@media (max-width: 450px) {
  .device-entry-container {
    margin: 0 auto;
  }
  .device-entry {
    height: 320px;
  }
  .device-entry .details {
    font-size: 1.2em;
  }
  .device-entry strong {
    font-size: 1.3em;
  }
  .estimated-js-message {
    font-size: 1.1em;
    padding: 2px;
  }
}
</style>
