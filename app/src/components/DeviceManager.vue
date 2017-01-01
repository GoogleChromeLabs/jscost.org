<template>
  <div class='container vertical around-justified layout' v-bind:class="{ hasCustomTrace: hasCustomTrace }">

    <!--
      @name: DeviceManagerControls
      @description: Configure the bundle size, network and TTI settings
    -->
    <div class='horizontal controls tabbed-pane-header'>

      <div class='controls-entry js-bundle-size'>
        <label for='input_jsbundleSizeBudget'>JavaScript Bundle Size</label>
        <input v-model='bundleSizeBudget' id='input_jsbundleSizeBudget'>KB
        <small class='blue'>{{computeGZippedSize}}KB gzipped</small>
      </div>

      <div class="toolbar-divider toolbar-item flex"></div>

      <div class='controls-entry change-network-speed'>
        <label for='input_downloadspeed'>Network</label>
        <select v-model='networkSelected' @change='changeNetworkSpeed'>
          <option v-for='option in network' v-bind:value='option.download'>
            {{ option.title }}
          </option>
        </select>
        <input v-model='downloadSpeed' id='input_downloadspeed'>Kbps
        <small class='blue gzip-preview'>{{computeDownloadTime}}ms for {{computeGZippedSize}}KB gz</small>
      </div>

      <div class="toolbar-divider toolbar-item flex"></div>

      <div class='controls-entry time-to-interactive'>
        <label for='input_tti'>Time-To-Interactive</label>
        <input id='tti' v-model='timeToInteractiveBudget'>ms
      </div>

      <div class="toolbar-divider toolbar-item flex"></div>

      <div class='controls-entry'>
        <input type='file' id='selectFile' v-on:change='fileSelected'/>
      </div>
    </div>
    <!--/controls -->


    <!--
      @name: DeviceManagerGrid
      @description: Devices with stat estimations based on controls/trace
    -->
    <div class='device-manager horizontal layout wrap'>
      <div v-for='item in devices' class='device-entry-container'>
        <div class='device-entry'>
          <div><strong><span>{{item.name}}</span></strong></div>
          <div><img :src='item.image'/></div>

          <!-- Template for synthetic benchmark -->
          <template v-if="traceStats.get('JS Frame') === undefined">
            <div class='details'>
              <div>
                <span class='timeline-aggregated-legend-value'>{{computeSum(item)}}ms</span>
                <span class='timeline-aggregated-legend-swatch' style='background-color: rgb(243, 210, 124);'></span>
                <span class='timeline-aggregated-legend-title'>Total Scripting</span>
              </div>

              <div>
                <span class='timeline-aggregated-legend-value'>{{computeValue('parse', item)}}ms</span>
                <span class='timeline-aggregated-legend-swatch' style='background-color: rgb(144, 194, 133);'></span>
                <span class='timeline-aggregated-legend-title'>Parse</span>
              </div>

              <div>
                <span class='timeline-aggregated-legend-value'>{{computeValue('eval',item)}}ms</span>
                <span class='timeline-aggregated-legend-swatch' style='background-color: rgb(144, 183, 234);'></span>
                <span class='timeline-aggregated-legend-title'>Evaluate</span>
              </div>

              <div>
                <span class='timeline-aggregated-legend-value'>{{computeTTIRemainder(item)}}ms</span>
                <span class='timeline-aggregated-legend-swatch' style='background-color: rgb(222, 222, 222);'></span>
                <span class='timeline-aggregated-legend-title'>TTI budget remaining</span>
              </div>
            </div>

            <progress :max='timeToInteractiveBudget' :value='computeTimeSum(item)'>
            </progress>
          </template>
          <!-- A user supplied trace will toggle the more detailed view -->
          <template v-else-if="traceStats.get('JS Frame') > 0">
            <div class='details'>
              <div>
                <span class='timeline-aggregated-legend-value'>{{getCustomTraceTotalScriptingTime(item)}}ms</span>
                <span class='timeline-aggregated-legend-swatch' style='background-color: rgb(243, 210, 124);'></span>
                <span class='timeline-aggregated-legend-title'>Total Scripting</span>
              </div>

              <div>
                <span class='timeline-aggregated-legend-value'>{{getCustomTraceEstimateForDeviceProp(item, 'JS Frame')}}ms</span>
                <span class='timeline-aggregated-legend-swatch' style='background-color: #EFB320;'></span>
                <span class='timeline-aggregated-legend-title'>JS Frame</span>
              </div>

              <div><!--#F3C75C-->
                <span class='timeline-aggregated-legend-value'>{{getCustomTraceEstimateForDeviceProp(item, 'Compile Script')}}ms</span>
                <span class='timeline-aggregated-legend-swatch' style='background-color: rgb(144, 194, 133);'></span>
                <span class='timeline-aggregated-legend-title'>Parse</span>
              </div>

              <div><!--#F4CE71-->
                <span class='timeline-aggregated-legend-value'>{{getCustomTraceEstimateForDeviceProp(item, 'Evaluate Script')}}ms</span>
                <span class='timeline-aggregated-legend-swatch' style='background-color: rgb(144, 183, 234);'></span>
                <span class='timeline-aggregated-legend-title'>Evaluate</span>
              </div>

              <div>
                <span class='timeline-aggregated-legend-value'>{{getCustomTraceEstimateForDeviceProp(item, 'Major GC')}}ms</span>
                <span class='timeline-aggregated-legend-swatch' style='background-color: #FAEAC2'></span>
                <span class='timeline-aggregated-legend-title'>Major GC</span>
              </div>

              <div>
                <span class='timeline-aggregated-legend-value'>{{getCustomTraceEstimateForDeviceProp(item, 'Minor GC')}}ms</span>
                <span class='timeline-aggregated-legend-swatch' style='background-color: #FAEAC2'></span>
                <span class='timeline-aggregated-legend-title'>Minor GC</span>
              </div>

              <div>
                <span class='timeline-aggregated-legend-value'>{{getCustomTraceEstimateForDeviceProp(item, 'Run Microtasks')}}ms</span>
                <span class='timeline-aggregated-legend-swatch' style='background-color: #AAAAAA;'></span>
                <span class='timeline-aggregated-legend-title'>Microtasks</span>
              </div>

              <div>
                <span class='timeline-aggregated-legend-value'>{{getCustomTraceParseHTMLCSSTime(item)}}ms</span>
                <span class='timeline-aggregated-legend-swatch' style='background-color: #A4C4ED'></span>
                <span class='timeline-aggregated-legend-title'>Parse HTML/CSS</span>
              </div>
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

              <div>
                <span class='timeline-aggregated-legend-value'>{{getCustomTraceEstimatedNetworkTransferTime()}}ms</span>
                <span class='timeline-aggregated-legend-swatch' style='background-color: #90B7EA'></span>
                <span class='timeline-aggregated-legend-title'>Load (emulated)</span>
              </div>

              <!--
                    This will only be present in the trace if the Network option is checked in DevTools
                    <div>
                      <span class='timeline-aggregated-legend-value'>{{traceStats.get('Finish Loading')}}ms</span>
                      <span class='timeline-aggregated-legend-swatch' style='background-color: #AAAAAA;'></span>
                      <span class='timeline-aggregated-legend-title'>Finish Loading</span>
                    </div>
              -->
              <div>
                <span class='timeline-aggregated-legend-value'>{{getCustomTraceEstimatedTTIRemaining(item)}}ms</span>
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
/* global FileReader */
import deviceConfig from './Devices.js'
import networkConditions from './Network.js'

export default {
  name: 'jscost',
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
      /* Most developers are testing on desktop with a fast connection. */
      /* Default to DevTools Wifi configuration that most traces will likely be based on */
      downloadSpeed: 30000,
      devices: deviceConfig,
      network: networkConditions,
      networkSelected: '30000',
      /* If a custom trace is selected, store the trace stats */
      traceStats: new Map(),
      /* Only truthy when a valid custom trace was supplied */
      hasCustomTrace: false
    }
  },
  methods: {
    changeNetworkSpeed () {
      this.downloadSpeed = this.networkSelected
    },

    /* Trace helpers */
    _filterEventsForNavStart (e) {
      return e.categoriesString.includes('blink.user_timing') && e.name === 'navigationStart'
    },

    _filterEventsForLoadEventEnd (e) {
      return e.categoriesString.includes('blink.user_timing') && e.name === 'loadEventEnd'
    },

    _filterEventsForDomLoading (e) {
      return e.categoriesString.includes('blink.user_timing') && e.name === 'domLoading'
    },

    _filterEventsForDomComplete (e) {
      return e.categoriesString.includes('blink.user_timing') && e.name === 'domComplete'
    },

    _filterEventsForDomInteractive (e) {
      return e.categoriesString.includes('blink.user_timing') && e.name === 'domInteractive'
    },

    _filterEventsForFirstTextPaint (e) {
      return e.categoriesString.includes('blink.user_timing') && e.name === 'firstTextPaint'
    },

    /*
      Compute the total time spent in script across JS Frame (CPU), Compile, Eval,
      Minor and Major GC events.
    */
    getCustomTraceTotalScriptingTime (item) {
      var JSFrame = this.getCustomTraceEstimateForDeviceProp(item, 'JS Frame')
      var CompileScript = this.getCustomTraceEstimateForDeviceProp(item, 'Compile Script')
      var EvaluateScript = this.getCustomTraceEstimateForDeviceProp(item, 'Evaluate Script')
      var MajorGC = this.getCustomTraceEstimateForDeviceProp(item, 'Major GC')
      var MinorGC = this.getCustomTraceEstimateForDeviceProp(item, 'Minor GC')
      return JSFrame + CompileScript + EvaluateScript + MajorGC + MinorGC
    },

    getCustomTraceParseHTMLCSSTime () {
      var traceParseHTML = parseInt(this.traceStats.get('Parse HTML'), 10)
      var traceParseCSS = parseInt(this.traceStats.get('Parse Stylesheet'), 10)
      return (traceParseHTML + traceParseCSS).toFixed(0)
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

    // WIP
    getCustomTraceSumOfTimeSpent (item) {
      // UPDATE JAVASCRIPT BUNDLE TEXT TO PAGE BUNDLE SIZE
      return Math.floor(this.getCustomTraceEstimatedNetworkTransferTime() + this.getCustomTraceTotalScriptingTime(item)).toFixed(0)
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

    // Handle trace selection
    fileSelected (e) {
      var files = e.target.files
      var file = files[0]
      var reader = new FileReader()
      reader.onload = function (e) {
        this.reportTraceContent(e.target.result, 'trace')
      }.bind(this)
      reader.readAsText(file)
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
        var domLoading = events.filter(this._filterEventsForDomLoading)
        var domComplete = events.filter(this._filterEventsForDomComplete)
        var domInteractive = events.filter(this._filterEventsForDomInteractive)
        var navStart = events.filter(this._filterEventsForNavStart)
        var loadEventEnd = events.filter(this._filterEventsForLoadEventEnd)

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
  },

  computed: {
    computeGZippedSize () {
      return Math.floor(this.bundleSizeBudget * 0.25)
    },
    computeDownloadTime () {
      return ((((Math.floor(this.bundleSizeBudget * 0.25)) * 8) / this.downloadSpeed) * 1000).toFixed(0)
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

.controls {
  padding: 5px 0px 0px 0px;
}

.controls-entry {
  margin-left: 2px;
}

.controls .flex {
  background: transparent;
}

label {
  font-weight: 700;
}

.details {
  text-align: left;
}

/* Mobile styles */
@media (max-width: 1250px) {
  .tabbed-pane-header {
    display: block;
  }
  .toolbar-divider {
    display: none;
  }
  .controls div {
    margin-bottom: 6px;
  }
}

@media (max-width: 450px) {
  strong span {
    font-size: 1.3em;
  }
  .device-entry-container {
    margin: 0 auto;
  }
  input {
    width: 35px;
  }
  .controls {
    text-align: left;
  }
}
</style>
