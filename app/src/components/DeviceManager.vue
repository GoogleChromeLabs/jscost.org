<template>
<div class='container vertical around-justified layout'>
  <!-- controls -->
  <div class='horizontal controls tabbed-pane-header'>
    <div class='controls-entry'>
      <label for='input_jsbundlesize'>JavaScript bundle size</label>
      <input v-model='bundleSize' id='input_jsbundlesize'>KB
      <small class='blue'>{{computeGZippedSize}}KB gzipped (estimate)</small>
    </div>

    <div class="toolbar-divider toolbar-item flex"></div>

    <div class='controls-entry'>
      <label for='input_downloadspeed'>Network</label>
        <select v-model='networkSelected' @change='changeNetwork'>
          <option v-for='option in network' v-bind:value='option.download'>
            {{ option.title }}
          </option>
        </select>
      <input v-model='downloadSpeed' id='input_downloadspeed'>Kbps
      <small class='blue'>{{computeDownloadTime}}ms for {{computeGZippedSize}}KB gz</small>
    </div>

    <div class="toolbar-divider toolbar-item flex"></div>

    <div class='controls-entry'>
      <label for='input_tti'>Time-To-Interactive</label>
      <input id='tti' v-model='timeToInteractive'>ms
    </div>

    <div class="toolbar-divider toolbar-item flex"></div>

    <div class='controls-entry'>
      <input type='file' id='selectFile' v-on:change='fileSelected'/>
    </div>
  </div>
  <!--/controls -->


  <!--devices-->
  <div class='device-manager horizontal layout wrap'>
    <div v-for='item in devices' class='device-entry-container'>
      <div class='device-entry'>
        <div><strong><span>{{item.name}}</span></strong></div>
        <div><img :src='item.image' /></div>

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
            <span class='timeline-aggregated-legend-title'>Parse Script</span>
          </div>

          <div>
            <span class='timeline-aggregated-legend-value'>{{computeValue('eval',item)}}ms</span>
            <span class='timeline-aggregated-legend-swatch' style='background-color: rgb(144, 183, 234);'></span>
            <span class='timeline-aggregated-legend-title'>Evaluate Script</span>
          </div>

          <div>
            <span class='timeline-aggregated-legend-value'>{{computeTTIRemainder(item)}}ms</span>
            <span class='timeline-aggregated-legend-swatch' style='background-color: rgb(222, 222, 222);'></span>
            <span class='timeline-aggregated-legend-title'>TTI Budget remaining</span>
          </div>
          </div>

         <progress :max='timeToInteractive' :value='computeTimeSum(item)'>
        </progress>         
</template>
<!-- A user supplied trace will toggle the more detailed view -->
<template v-else-if="traceStats.get('JS Frame') > 0">
    <div class='details'>
          <div>
            <span class='timeline-aggregated-legend-value'>{{estimateDeviceTotalScriptingTime(item)}}ms</span>
            <span class='timeline-aggregated-legend-swatch' style='background-color: rgb(243, 210, 124);'></span>
            <span class='timeline-aggregated-legend-title'>Total Scripting</span>
          </div>

          <div>
            <span class='timeline-aggregated-legend-value'>{{estimateDeviceStatsFromTrace(item, 'JS Frame')}}ms</span>
            <span class='timeline-aggregated-legend-swatch' style='background-color: rgb(222, 222, 222);'></span>
            <span class='timeline-aggregated-legend-title'>JS Frame</span>
          </div>

          <div>
            <span class='timeline-aggregated-legend-value'>{{estimateDeviceStatsFromTrace(item, 'Compile Script')}}ms</span>
            <span class='timeline-aggregated-legend-swatch' style='background-color: rgb(222, 222, 222);'></span>
            <span class='timeline-aggregated-legend-title'>Parse</span>
          </div>

          <div>
            <span class='timeline-aggregated-legend-value'>{{estimateDeviceStatsFromTrace(item, 'Evaluate Script')}}ms</span>
            <span class='timeline-aggregated-legend-swatch' style='background-color: rgb(222, 222, 222);'></span>
            <span class='timeline-aggregated-legend-title'>Evaluate</span>
          </div>

          <div>
            <span class='timeline-aggregated-legend-value'>{{estimateDeviceStatsFromTrace(item, 'Major GC')}}ms</span>
            <span class='timeline-aggregated-legend-swatch' style='background-color: rgb(222, 222, 222);'></span>
            <span class='timeline-aggregated-legend-title'>Major GC</span>
          </div>

          <div>
            <span class='timeline-aggregated-legend-value'>{{estimateDeviceStatsFromTrace(item, 'Minor GC')}}ms</span>
            <span class='timeline-aggregated-legend-swatch' style='background-color: rgb(222, 222, 222);'></span>
            <span class='timeline-aggregated-legend-title'>Minor GC</span>
          </div>

          <div>
            <span class='timeline-aggregated-legend-value'>{{estimateDeviceStatsFromTrace(item, 'Run Microtasks')}}ms</span>
            <span class='timeline-aggregated-legend-swatch' style='background-color: rgb(222, 222, 222);'></span>
            <span class='timeline-aggregated-legend-title'>Microtasks</span>
          </div>

          <div>
            <span class='timeline-aggregated-legend-value'>{{estimateDeviceTotalTTIRemaining(item)}}ms</span>
            <span class='timeline-aggregated-legend-swatch' style='background-color: rgb(222, 222, 222);'></span>
            <span class='timeline-aggregated-legend-title'>TTI Budget Remaining</span>
          </div>
</div>
        <progress :max='timeToInteractive' :value='estimateDeviceTimeSum(item)'>
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
      baseSize: 1048,
      bundleSize: 1200,
      timeToInteractive: 5000,
      downloadSpeed: 30000,
      devices: deviceConfig,
      network: networkConditions,
      networkSelected: '30000',
      // Custom trace supplied
      traceStats: new Map()
    }
  },
  methods: {
    changeNetwork () {
      this.downloadSpeed = this.networkSelected
    },

    estimateDeviceTotalScriptingTime (item) {
      // ...
      var JSFrame = this.estimateDeviceStatsFromTrace(item, 'JS Frame')
      var CompileScript = this.estimateDeviceStatsFromTrace(item, 'Compile Script')
      var EvaluateScript = this.estimateDeviceStatsFromTrace(item, 'Evaluate Script')
      var MajorGC = this.estimateDeviceStatsFromTrace(item, 'Major GC')
      var MinorGC = this.estimateDeviceStatsFromTrace(item, 'Minor GC')
      return JSFrame + CompileScript + EvaluateScript + MajorGC + MinorGC
    },

    estimateDeviceTotalTTIRemaining (item) {
      return Math.floor(this.timeToInteractive - this.estimateDeviceTimeSum(item)).toFixed(0)
    },

    estimateDeviceTimeSum (item) {
      return Math.floor((((((Math.floor(this.bundleSize * 0.25)) * 8) / this.downloadSpeed) * 1000)) + this.estimateDeviceTotalScriptingTime(item) * (this.bundleSize / this.baseSize)).toFixed(0)
    },

    // Experiment
    estimateDeviceStatsFromTrace (item, key) {
      // TODO: We may not need the other get relatives....
      // Assume the trace was taken on a high-end desktop, like an MBP
      // Let's first calculate how much time the default benchmark spends
      // in script for that device. We'll use this as a relative weight.
      var totalScriptingBaseline = deviceConfig[0].parse + deviceConfig[0].eval
      // Next, what's the total time in script for the current device?
      var totalScriptingForDevice = item.parse + item.eval
      // Calculate multiplier relative to the mbp scores as they're the same app
      // var multiplier = (totalScriptingForDevice / totalScriptingBaseline).toFixed(2)
      var multiplier = (parseInt(this.traceStats.get(key), 10) / totalScriptingBaseline).toFixed(2)
      // Adjust device stats and trace stats based on this multiplier
      return Math.floor(totalScriptingForDevice * multiplier)

      // Stats from the processed trace
      // this.JSFrame = parseInt(traceStats.get('JS Frame'), 10) * multiplier
      // this.CompileScript = parseInt(traceStats.get('Compile Script'), 10) * multiplier
      // this.Layout = parseInt(traceStats.get('Layout'), 10) * multiplier
      // this.MajorGC = parseInt(traceStats.get('Major GC'), 10) * multiplier
      // this.parseHTML = parseInt(traceStats.get('Parse HTML'), 10) * multiplier
      // this.RecalcStyles = parseInt(traceStats.get('Parse HTML'), 10) * multiplier
      // this.MinorGC = parseInt(traceStats.get('Minor GC'), 10) * multiplier
      // this.EvaluateScript = parseInt(traceStats.get('Evaluate Script'), 10) * multiplier
      // this.RunMicrotasks = parseInt(traceStats.get('Run Microtasks'), 10) * multiplier
      // this.UpdateLayerTree = parseInt(traceStats.get('Layer Tree'), 10) * multiplier
      // this.DOMGC = parseInt(traceStats.get('DOM GC'), 10) * multiplier
      // this.Paint = parseInt(traceStats.get('Paint'), 10) * multiplier
      // this.ParseStylesheet = parseInt(traceStats.get('Parse Stylesheet'), 10) * multiplier
    },
    // End experiment

    computeSum (item) {
      return Math.floor(item.parse * (this.bundleSize / this.baseSize)) + Math.floor(item.eval * (this.bundleSize / this.baseSize))
    },

    computeValue (field, item) {
      return Math.floor(item[field] * (this.bundleSize / this.baseSize))
    },

    computeTimeSum (item) {
      return Math.floor(((((Math.floor(this.bundleSize * 0.25)) * 8) / this.downloadSpeed) * 1000) + Math.floor(item.parse * (this.bundleSize / this.baseSize)) + Math.floor(item.eval * (this.bundleSize / this.baseSize)))
    },

    computeTTIRemainder (item) {
      return Math.floor(this.timeToInteractive - (((((Math.floor(this.bundleSize * 0.25)) * 8) / this.downloadSpeed) * 1000).toFixed(0)) - Math.floor(item.parse * (this.bundleSize / this.baseSize)) - Math.floor(item.eval * (this.bundleSize / this.baseSize))).toFixed(0)
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
        // Bottom up tree grouped by EventName
        this.traceStats = tree['_c']
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
      return Math.floor(this.bundleSize * 0.25)
    },
    computeDownloadTime () {
      return ((((Math.floor(this.bundleSize * 0.25)) * 8) / this.downloadSpeed) * 1000).toFixed(0)
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
  height: 400px;
  padding: 10px;
  text-align: center;
  display: block;
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
