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
            <span class='timeline-aggregated-legend-title'>Budget remaining</span>
          </div>

        </div>

        <progress :max='timeToInteractive' :value='computeTimeSum(item)'>
        </progress>

      </div>
 </div>

</template>

<script>
const deviceConfig = [{
  'name': 'Macbook Pro - Chrome 55',
  'parse': 247.844,
  'eval': 13.65,
  'image': './static/macbook-pro.jpg'
}, {
  'name': 'Macbook Pro - Safari 10',
  'parse': 69.914,
  'eval': 173.93,
  'image': './static/macbook-pro.jpg'
}, {
  'name': 'Moto G4 - Chrome 55',
  'parse': 1429,
  'eval': 73,
  'image': './static/motog4.jpg'
}, {
  'name': 'Nexus 5X - Chrome 55',
  'parse': 1038.965,
  'eval': 55.339,
  'image': './static/nexus5x.jpg'
}, {
  'name': 'Nexus 5 - Chrome 55',
  'parse': 1834.46,
  'eval': 200.435,
  'image': './static/nexus5.jpg'
}, {
  'name': 'iPhone 7 iOS 10 - Safari',
  'parse': 76.78,
  'eval': 72,
  'image': './static/iphone-7.jpg'
}, {
  'name': 'iPhone 6 iOS 9 - Safari',
  'parse': 890,
  'eval': 72,
  'image': './static/iphone-6.jpg'
}, {
  'name': 'iPhone 5c iOS 9 - Safari',
  'parse': 1429,
  'eval': 71,
  'image': './static/iphone-5c.jpg'
}, {
  'name': 'PixelXL - Chrome 55',
  'parse': 1114,
  'eval': 40,
  'image': './static/pixelxl.jpg'
}, {
  'name': 'Moto E - Chrome 55',
  'parse': 2806.21,
  'eval': 141.089,
  'image': './static/moto-e.jpg'
}, {
  'name': 'Galaxy S7 - Chrome 55',
  'parse': 956.16,
  'eval': 31.654,
  'image': './static/galaxy-s7.jpg'
}, {
  'name': 'Galaxy S6 - Chrome 55',
  'parse': 1141.63,
  'eval': 42.649,
  'image': './static/galaxy-s6.jpg'
}, {
  'name': 'Galaxy S5 - Chrome 55',
  'parse': 2224.495,
  'eval': 75.909,
  'image': './static/galaxy-s5.jpg'
}, {
  'name': 'Moto G1 - Chrome 55',
  'parse': 2936.944,
  'eval': 169.385,
  'image': './static/motog-gen1.jpg'
}, {
  'name': 'Nexus 7 - Chrome 55',
  'parse': 3005.095,
  'eval': 115.724,
  'image': './static/nexus-7.jpg'
}, {
  'name': 'Thinkpad T430 - Chrome 55',
  'parse': 290.51,
  'eval': 40.545,
  'image': './static/thinkpad-t430.jpg'
}, {
  'name': 'Thinkpad T430 - Firefox 50',
  'parse': 165.205,
  'eval': 7.634,
  'image': './static/thinkpad-t430.jpg'
}, {
  'name': 'Thinkpad T430 - Microsoft Edge',
  'parse': 384.795,
  'eval': 1955.314,
  'image': './static/thinkpad-t430.jpg'
}, {
  'name': 'Android One Airtel 3G - Chrome 55',
  'parse': 3092.525,
  'eval': 140.824,
  'image': './static/android-one.jpg'
}]

const networkConditions = [{
  title: 'GPRS',
  download: 50, // 50kbps
  latency: 500 // 500ms
}, {
  title: 'Regular 2G',
  download: 250, // 250kbps
  latency: 300 // 300ms
}, {
  title: 'Good 2G',
  download: 450, // 450kbps
  latency: 150 // 150ms
}, {
  title: 'Regular 3G',
  download: 750, // 750kbps
  latency: 100 // 100ms
}, {
  title: 'Good 3G',
  download: 1500, // 1.5mbps
  latency: 40 // 40ms
}, {
  title: 'Regular 4G',
  download: 4000, // 4mbps
  latency: 20 // 20ms
}, {
  title: 'DSL',
  download: 2000, // 2mbps
  latency: 5 // 5ms
}, {
  title: 'WiFi',
  download: 30000, // 30mbps
  latency: 2 // 2ms
}]

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
