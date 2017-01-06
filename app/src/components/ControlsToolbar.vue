<template>
  <!--
    ControlsToolbar provides a toolbar for configuring the DeviceManager.
    It exposes a number of events that can be used to trigger actions in a
    parent, such as when the Network emulation has been changed or the JavaScript
    bundle size has been modified. The events this component emits that can be
    listened for are:

    `traceselected`: A custom trace file has been selected from disk
    `bundlesizechange`: The bundle size has been modified via user input
    `networkchange`: Network emulation profile has been modified (dropdown/input)
    `ttichange`: The Time-To-Interactive budget has been changed.

    The component is used as follows:

    <toolbar-controls
      v-on:traceselected='reportTraceContent'
      v-on:bundlesizechange='bundleSizeChanged'
      v-on:networkchange='networkSpeedChanged'
      v-on:ttichange= 'ttiChanged'
    ></toolbar-controls>
    -->
  <div class='horizontal controls tabbed-pane-header'>
    <!-- JavaScript bundle size -->
    <div class='controls-entry js-bundle-size'>
      <label for='input_jsbundleSizeBudget'>JavaScript Bundle Size</label>
      <input v-model='bundleSizeBudget' id='input_jsbundleSizeBudget' v-on:input='changeBundleSize'>KB
      <small class='gz'>{{computeGZippedSize}}KB gzipped</small>
    </div>

    <div class="toolbar-divider toolbar-item flex"></div>

    <!-- Network emulation -->
    <div class='controls-entry change-network-speed'>
      <label for='input_downloadspeed'>Network</label>
      <select v-model='networkSelected' @change='changeNetworkSpeed'>
        <option v-for='option in network' v-bind:value='option.download'>
          {{ option.title }}
        </option>
      </select>
      <input v-model='downloadSpeed' id='input_downloadspeed' v-on:input='changeCustomNetworkSpeed'>Kbps
      <small class='gz gzip-preview'>{{computeDownloadTime}}ms for {{computeGZippedSize}}KB gz</small>
    </div>

    <div class="toolbar-divider toolbar-item flex"></div>

    <!-- Time to interactive -->
    <div class='controls-entry time-to-interactive'>
      <label for='input_tti'>Time-To-Interactive</label>
      <input id='tti' v-model='timeToInteractiveBudget' v-on:input='changeTTI'>ms
    </div>

    <div class="toolbar-divider toolbar-item flex"></div>

    <!-- Upload custom Timeline trace -->
    <div class='controls-entry'>
      <input type='file' id='selectFile' v-on:change='customTraceSelected'/>
    </div>

    <!-- Reset the state of the world -->
    <button v-on:click='reset'>Reset</button>
  </div>
</template>
<script>
/* global FileReader */
import networkConditions from './Network.js'

function getDefaultData () {
  return {
    bundleSizeBudget: 1200,
    gzippedBundleSize: 0,
    downloadSpeed: 30000,
    network: networkConditions,
    networkSelected: '30000',
    timeToInteractiveBudget: 5000
  }
}

export default {
  data: getDefaultData,
  methods: {
    changeTTI () {
      this.$emit('ttichange', this.timeToInteractiveBudget)
    },
    changeBundleSize () {
      this.$emit('bundlesizechange', this.bundleSizeBudget)
    },
    changeNetworkSpeed () {
      this.downloadSpeed = this.networkSelected
      this.$emit('networkchange', this.downloadSpeed)
    },
    changeCustomNetworkSpeed () {
      this.$emit('networkchange', this.downloadSpeed)
    },
    // Handle trace selection
    customTraceSelected (e) {
      var files = e.target.files
      var file = files[0]
      var reader = new FileReader()
      reader.onload = function (e) {
        this.$emit('traceselected', e.target.result)
      }.bind(this)
      reader.readAsText(file)
    },
    /* 🚿 the world */
    reset () {
      Object.assign(this.$data, getDefaultData())
      this.$emit('reset')
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
<style scoped>
@import url('./DeviceManager-FlexHelpers.css');

.controls {
  padding: 5px 0px 0px 0px;
}

.controls .gz {
  color: blue;
}

.controls.dark {
  background-color: #333333;
  color: #f3f3f3;
}

.controls.dark .gz {
  color: #F1DD3F
}

input {
  /*width: 50px;*/
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

.hasCustomTrace .js-bundle-size, .hasCustomTrace .gzip-preview {
  display: none;
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
  input {
    width: 35px;
  }
  .controls {
    text-align: left;
  }
}
</style>
