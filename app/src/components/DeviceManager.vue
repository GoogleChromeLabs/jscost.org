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
    <div v-for='item in devices'>
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

.square {
  width: 16px;
  height: 16px;
}

.yellow {
  background-color: #F3D27C;
  border: 1px solid #C3A863;
}

.green {
  background-color: #90C285;
  border: 1px solid #6E9766;
}

/*Web Inspector styles*/
.timeline-aggregated-info-legend > div {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.timeline-aggregated-legend-value {
  display: inline-block;
  width: 70px;
  text-align: right;
}

.timeline-aggregated-legend-swatch {
  display: inline-block;
  width: 11px;
  height: 11px;
  margin: 0 6px;
  position: relative;
  top: 1px;
  border: 1px solid rgba(0, 0, 0, 0.2);
}

.details {
  color: rgb(48, 57, 66);
  text-align: left;
  font-family: '.SFNSDisplay-Regular', 'Helvetica Neue', 'Lucida Grande', sans-serif;
}

.tabbed-pane-header {
    display: flex;
    flex: 0 0 27px;
    border-bottom: 1px solid #ccc;
    overflow: visible;
    width: 100%;
    background-color: #f3f3f3;
}

/* Highlights */
.blue {
  color: blue;
}

/* Separator */
.toolbar-item {
    position: relative;
    display: flex;
    background-color: transparent;
    flex: none;
    align-items: center;
    justify-content: center;
    padding: 0;
    height: 26px;
    border: none;
    color: #5a5a5a;
}

.toolbar-divider {
    background-color: #ccc;
    width: 1px;
    margin: 5px 4px;
    height: 16px;
}

.toolbar-spacer {
    flex: auto;
}

.controls {
  padding: 5px 0px 0px 5px;
}

label {
  font-weight: 700;
}

.controls .flex {
  background:transparent;
}

  /*******************************
            Flex Layout
  *******************************/

  .layout.horizontal,
  .layout.horizontal-reverse,
  .layout.vertical,
  .layout.vertical-reverse {
    display: -ms-flexbox;
    display: -webkit-flex;
    display: flex;
  }

  .layout.inline {
    display: -ms-inline-flexbox;
    display: -webkit-inline-flex;
    display: inline-flex;
  }

  .layout.horizontal {
    -ms-flex-direction: row;
    -webkit-flex-direction: row;
    flex-direction: row;
  }

  .layout.horizontal-reverse {
    -ms-flex-direction: row-reverse;
    -webkit-flex-direction: row-reverse;
    flex-direction: row-reverse;
  }

  .layout.vertical {
    -ms-flex-direction: column;
    -webkit-flex-direction: column;
    flex-direction: column;
  }

  .layout.vertical-reverse {
    -ms-flex-direction: column-reverse;
    -webkit-flex-direction: column-reverse;
    flex-direction: column-reverse;
  }

  .layout.wrap {
    -ms-flex-wrap: wrap;
    -webkit-flex-wrap: wrap;
    flex-wrap: wrap;
  }

  .layout.wrap-reverse {
    -ms-flex-wrap: wrap-reverse;
    -webkit-flex-wrap: wrap-reverse;
    flex-wrap: wrap-reverse;
  }

  .flex-auto {
    -ms-flex: 1 1 auto;
    -webkit-flex: 1 1 auto;
    flex: 1 1 auto;
  }

  .flex-none {
    -ms-flex: none;
    -webkit-flex: none;
    flex: none;
  }

  .flex,
  .flex-1 {
    -ms-flex: 1;
    -webkit-flex: 1;
    flex: 1;
  }

  .flex-2 {
    -ms-flex: 2;
    -webkit-flex: 2;
    flex: 2;
  }

  .flex-3 {
    -ms-flex: 3;
    -webkit-flex: 3;
    flex: 3;
  }

  .flex-4 {
    -ms-flex: 4;
    -webkit-flex: 4;
    flex: 4;
  }

  .flex-5 {
    -ms-flex: 5;
    -webkit-flex: 5;
    flex: 5;
  }

  .flex-6 {
    -ms-flex: 6;
    -webkit-flex: 6;
    flex: 6;
  }

  .flex-7 {
    -ms-flex: 7;
    -webkit-flex: 7;
    flex: 7;
  }

  .flex-8 {
    -ms-flex: 8;
    -webkit-flex: 8;
    flex: 8;
  }

  .flex-9 {
    -ms-flex: 9;
    -webkit-flex: 9;
    flex: 9;
  }

  .flex-10 {
    -ms-flex: 10;
    -webkit-flex: 10;
    flex: 10;
  }

  .flex-11 {
    -ms-flex: 11;
    -webkit-flex: 11;
    flex: 11;
  }

  .flex-12 {
    -ms-flex: 12;
    -webkit-flex: 12;
    flex: 12;
  }

  /* alignment in cross axis */

  .layout.start {
    -ms-flex-align: start;
    -webkit-align-items: flex-start;
    align-items: flex-start;
  }

  .layout.center,
  .layout.center-center {
    -ms-flex-align: center;
    -webkit-align-items: center;
    align-items: center;
  }

  .layout.end {
    -ms-flex-align: end;
    -webkit-align-items: flex-end;
    align-items: flex-end;
  }

  /* alignment in main axis */

  .layout.start-justified {
    -ms-flex-pack: start;
    -webkit-justify-content: flex-start;
    justify-content: flex-start;
  }

  .layout.center-justified,
  .layout.center-center {
    -ms-flex-pack: center;
    -webkit-justify-content: center;
    justify-content: center;
  }

  .layout.end-justified {
    -ms-flex-pack: end;
    -webkit-justify-content: flex-end;
    justify-content: flex-end;
  }

  .layout.around-justified {
    -ms-flex-pack: around;
    -webkit-justify-content: space-around;
    justify-content: space-around;
  }

  .layout.justified {
    -ms-flex-pack: justify;
    -webkit-justify-content: space-between;
    justify-content: space-between;
  }

  /* self alignment */

  .self-start {
    -ms-align-self: flex-start;
    -webkit-align-self: flex-start;
    align-self: flex-start;
  }

  .self-center {
    -ms-align-self: center;
    -webkit-align-self: center;
    align-self: center;
  }

  .self-end {
    -ms-align-self: flex-end;
    -webkit-align-self: flex-end;
    align-self: flex-end;
  }

  .self-stretch {
    -ms-align-self: stretch;
    -webkit-align-self: stretch;
    align-self: stretch;
  }

  /*******************************
            Other Layout
  *******************************/

  .block {
    display: block;
  }

  /* IE 10 support for HTML5 hidden attr */
  [hidden] {
    display: none !important;
  }

  .invisible {
    visibility: hidden !important;
  }

  .relative {
    position: relative;
  }

  .fit {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
  }

  body.fullbleed {
    margin: 0;
    height: 100vh;
  }

  .scroll {
    -webkit-overflow-scrolling: touch;
    overflow: auto;
  }

  /* fixed position */

  .fixed-bottom,
  .fixed-left,
  .fixed-right,
  .fixed-top {
    position: fixed;
  }

  .fixed-top {
    top: 0;
    left: 0;
    right: 0;
  }

  .fixed-right {
    top: 0;
    right: 0;
    bottom: 0;
  }

  .fixed-bottom {
    right: 0;
    bottom: 0;
    left: 0;
  }

  .fixed-left {
    top: 0;
    bottom: 0;
    left: 0;
  }
</style>
