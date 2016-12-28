<template>
<div class='container vertical around-justified layout'>
  <!-- controls -->
  <div class='horizontal controls tabbed-pane-header'>
    <div>
      <label for='input_jsbundlesize'>JavaScript bundle size</label>
      <input v-model='bundleSize' id='input_jsbundlesize'>KB
      <small class='blue'>{{computeGZippedSize}}KB gzipped (estimate)</small>
    </div>

    <div class="toolbar-divider toolbar-item flex"></div>

    <div>
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

    <div>
      <label for='input_tti'>Target Time-To-Interactive</label>
      <input id='tti' v-model='timeToInteractive'>ms
    </div>

    <div class="toolbar-divider toolbar-item flex"></div>
  </div>
  <!--/controls -->


  <!--devices-->
  <div class='device-manager horizontal layout wrap'>
    <div v-for='item in devices' class='device-entry-container'>
      <div class='device-entry'>
        <div><strong><span>{{item.name}}</span></strong></div>
        <div><img :src='item.image' /></div>

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
            <span class='timeline-aggregated-legend-title'>Eval</span>
          </div>

          <div>
            <span class='timeline-aggregated-legend-value'>{{computeTTIRemainder(item)}}ms</span>
            <span class='timeline-aggregated-legend-swatch' style='background-color: rgb(222, 222, 222);'></span>
            <span class='timeline-aggregated-legend-title'>TTI Budget remaining</span>
          </div>

        </div>

        <progress :max='timeToInteractive' :value='computeTimeSum(item)'>
        </progress>

      </div>
 </div>

</template>

<script>
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
      networkSelected: '30000'
    }
  },
  methods: {
    changeNetwork () {
      this.downloadSpeed = this.networkSelected
    },

    computeSum (item) {
      return Math.floor(item.parse * (this.bundleSize / this.baseSize)) + Math.floor(item.eval * (this.bundleSize / this.baseSize))
    },

    computeValue (field, item) {
      return Math.floor(item[field] * (this.bundleSize / this.baseSize))
    },

    computeTimeSum (item) {
      return (((((Math.floor(this.bundleSize * 0.25)) * 8) / this.downloadSpeed) * 1000) + Math.floor(item.parse * (this.bundleSize / this.baseSize)) + Math.floor(item.eval * (this.bundleSize / this.baseSize))).toFixed(0)
    },

    computeTTIRemainder (item) {
      return (this.timeToInteractive - (((((Math.floor(this.bundleSize * 0.25)) * 8) / this.downloadSpeed) * 1000).toFixed(0)) - Math.floor(item.parse * (this.bundleSize / this.baseSize)) - Math.floor(item.eval * (this.bundleSize / this.baseSize))).toFixed(0)
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
  height: 280px;
  padding: 10px;
  text-align: center;
  display: block;
}

.device-entry img {
  width: 140px;
  margin-top: 10px;
}

.controls {
  padding: 5px 0px 0px 5px;
}

.controls .flex {
  background: transparent;
}

label {
  font-weight: 700;
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
