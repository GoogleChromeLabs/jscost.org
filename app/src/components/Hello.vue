<template>
<div class='container horizontal around-justified layout'>

  <div>
    <h4>JavaScript Bundle Size</h4>
    <label for='input_jsbundlesize'>JS bundle size</label>
    <input v-model='bundleSize' id='input_jsbundlesize'>KB
    <small>{{computeGZippedSize}}KB gzipped (estimate)</small>
  </div>

  <div>
    <h4>Download Speed</h4>
    <label for='input_downloadspeed'>Transfer speed</label>
    <input v-model='downloadSpeed' id='input_downloadspeed'>Kbps
    <small>{{computeDownloadTime}}ms for {{computeGZippedSize}}KB gz</small>
  </div>

  <!-- Network selection -->
  <select v-model='networkSelected' @change='changeNetwork'>
    <option v-for='option in network' v-bind:value='option.download'>
      {{ option.title }}
    </option>
  </select>

  <div>
    <h4>Target Time To Interactive</h4>
    <label for='input_tti'>User can interact in</label>
    <input id='tti' v-model='timeToInteractive'>ms
  </div>


  <!--view-->
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
var deviceConfig = [{
  'name': 'Macbook Pro - Chrome',
  'parse': 275.9,
  'eval': 23.45,
  'image': './static/macbook-pro.jpg'
}, {
  'name': 'Moto G4 - Chrome',
  'parse': 1429,
  'eval': 73,
  'image': './static/motog4.jpg'
}, {
  'name': 'Moto G1 - Chrome',
  'parse': 2714.32,
  'eval': 135.824,
  'image': './static/motog-gen1.jpg'
}, {
  'name': 'Nexus 5 - Chrome',
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
  'name': 'PixelXL - Chrome',
  'parse': 1114,
  'eval': 40,
  'image': './static/pixelxl.jpg'
}, {
  'name': 'Moto E - Chrome',
  'parse': 2806.21,
  'eval': 141.089,
  'image': './static/moto-e.jpg'
}, {
  'name': 'Galaxy S7 - Chrome',
  'parse': 956.16,
  'eval': 31.654,
  'image': './static/galaxy-s7.jpg'
}, {
  'name': 'Galaxy S5 - Chrome',
  'parse': 2224.495,
  'eval': 75.909,
  'image': './static/galaxy-s5.jpg'
}, {
  'name': 'Nexus 7 - Chrome',
  'parse': 3005.095,
  'eval': 115.724,
  'image': './static/nexus-7.jpg'
}, {
  'name': 'Thinkpad T430 - Chrome',
  'parse': 290.51,
  'eval': 40.545,
  'image': './static/thinkpad-t430.jpg'
}, {
  'name': 'Thinkpad T430 - Firefox',
  'parse': 165.205,
  'eval': 7.634,
  'image': './static/thinkpad-t430.jpg'
}, {
  'name': 'Thinkpad T430 - Microsoft Edge',
  'parse': 384.795,
  'eval': 1955.314,
  'image': './static/thinkpad-t430.jpg'
}, {
  'name': 'Android One Airtel 3G',
  'parse': 3092.525,
  'eval': 140.824,
  'image': './static/android-one.jpg'
}]

var networkConditions = [{
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
  data: function () {
    return {
      baseSize: 1048,
      bundleSize: 1200,
      timeToInteractive: 5000,
      downloadSpeed: 750,
      devices: deviceConfig,
      network: networkConditions,
      networkSelected: '750'
    }
  },
  methods: {
    changeNetwork: function () {
      this.downloadSpeed = this.networkSelected
    },

    computeSum: function (item) {
      return Math.floor(item.parse * (this.bundleSize / this.baseSize)) + Math.floor(item.eval * (this.bundleSize / this.baseSize))
    },

    computeValue: function (field, item) {
      return Math.floor(item[field] * (this.bundleSize / this.baseSize))
    },

    computeTimeSum: function (item) {
      return (((((Math.floor(this.bundleSize * 0.25)) * 8) / this.downloadSpeed) * 1000) + Math.floor(item.parse * (this.bundleSize / this.baseSize)) + Math.floor(item.eval * (this.bundleSize / this.baseSize))).toFixed(0)
    },

    computeTTIRemainder: function (item) {
      return (this.timeToInteractive - (((((Math.floor(this.bundleSize * 0.25)) * 8) / this.downloadSpeed) * 1000).toFixed(0)) - Math.floor(item.parse * (this.bundleSize / this.baseSize)) - Math.floor(item.eval * (this.bundleSize / this.baseSize))).toFixed(0)
    }
  },

  computed: {
    computeGZippedSize: function () {
      return Math.floor(this.bundleSize * 0.25)
    },
    computeDownloadTime: function () {
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
  height: 350px;
  padding: 10px;
  text-align: center;
  display: block;
}

.device-entry img {
  width: 140px;
}

/*devtools squares*/
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
</style>
