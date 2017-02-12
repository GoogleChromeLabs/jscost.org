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
  <div class='layout center-center horizontal controls tabbed-pane-header dark'>

    <!-- JavaScript bundle size -->
    <!--<div class='controls-entry js-bundle-size'>
      <label for='input_jsbundleSizeBudget'>JavaScript Size</label>
      <input v-model='bundleSizeBudget' id='input_jsbundleSizeBudget' v-on:input='changeBundleSize'> KB
      <small class='gz'>{{computeGZippedSize()}}KB gzipped</small>
    </div>

    <div class='toolbar-divider toolbar-item' v-show='!customTraceLoaded'></div>-->

    <!-- Network emulation -->
    <div class='controls-entry change-network-speed'>
      <label for='input_downloadspeed'>Network</label>
      <select v-model='networkSelected' @change='changeNetworkSpeed'>
        <option v-for='option in network' v-bind:value='option.download'>
          {{ option.title }}
        </option>
      </select>
      <input v-show='isNetworkSpeedCustom()' v-model='downloadSpeed' id='input_downloadspeed' v-on:input='changeCustomNetworkSpeed'> 
      <span v-show='isNetworkSpeedCustom()'> Kbps</span>
      <!--<small class='gz gzip-preview'>{{computeDownloadTime()}}ms for {{computeGZippedSize()}}KB gz</small>-->
    </div>

    <div class='toolbar-divider toolbar-item' v-show='advancedMode'></div>

    <!-- Time to interactive -->
    <div class='controls-entry time-to-interactive' v-show='advancedMode'>
      <label for='input_tti'>Interactivity Budget</label>
      <input id='tti' v-model='timeToInteractiveBudget' v-on:input='changeTTI'> ms
    </div>

    <div class='toolbar-divider toolbar-item'></div>

    <!-- Upload custom Timeline trace -->
    <div class='controls-entry custom-trace'>
      <!--<label for='selectFile'>Select Timeline Trace</label>-->
      <input  id='selectFile' type='file' v-on:change='customTraceSelected'/>
      <input class='mdl-button mdl-button--colored mdl-button--raised' type='submit' id='uploadTimelineBtn' value='Select DevTools Trace' @click='uploadTimelineTrace'/>
    </div>

    <!-- Reset the state of the world -->
    <div class='toolbar-divider toolbar-item' v-show='customTraceLoaded'></div>
    <div class='controls-entry custom-trace' v-show='customTraceLoaded'>
      <input class='mdl-button mdl-button--colored mdl-button--raised' type='submit' value='Reset' v-on:click='reset'/>
    </div>

    <div class='toolbar-divider toolbar-item'></div>
    <!-- BUG: This isn't toggling -->
    <span @click='toggleAdvanced' class='advanced'>Advanced</span>
  </div>
</template>
<script>
/* global FileReader */
import config from './Config.js'

function getDefaultData () {
  let defaults = {}
  Object.assign(defaults, config)
  return defaults
}

export default {
  data: getDefaultData,
  methods: {
    isNetworkSpeedCustom () {
      return !!(this.networkSelected === 0)
    },
    uploadTimelineTrace () {
      this.$el.querySelector('#selectFile').click()
    },
    changeTTI () {
      this.$emit('ttiChanged', this.timeToInteractiveBudget)
    },
    changeBundleSize () {
      this.$emit('bundlesizeChanged', this.bundleSizeBudget)
    },
    changeNetworkSpeed () {
      this.downloadSpeed = this.networkSelected
      this.$emit('networkChanged', this.downloadSpeed)
    },
    changeCustomNetworkSpeed () {
      this.$emit('networkChanged', this.downloadSpeed)
    },
    // Handle trace selection
    customTraceSelected (e) {
      this.$emit('beforeTraceRead')
      this.reset()
      let files = e.target.files
      let file = files[0]
      let reader = new FileReader()
      reader.onload = function (e) {
        this.$emit('traceSelected', e.target.result)
        this.customTraceLoaded = true
      }.bind(this)
      reader.readAsText(file)
    },
    /* 🚿 the world */
    reset () {
      Object.assign(this.$data, getDefaultData())
      this.$emit('reset')
    },
    setNetwork (kbps) {
      this.downloadSpeed = kbps
      this.networkSelected = kbps.toString()
    },
    toggleAdvanced () {
      this.advancedMode = !this.advancedMode
    },
    computeGZippedSize () {
      return Math.floor(this.bundleSizeBudget * 0.3)
    },
    computeDownloadTime () {
      return this.calculateTransferRate(this.computeGZippedSize(this.bundleSizeBudget), this.downloadSpeed / 1000).toFixed(0)
    },
    calculateTransferRate (fileSizeMB, transferRateMbps) {
      // http://superuser.com/a/361237
      // [1024 Mio/Gio] * [8 Mb/Mio] / 94.92848% ≈ 8630
      return ((8630 * (fileSizeMB / 1000)) / transferRateMbps)
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
  width: 60px;
}

#uploadTimelineBtn {
  width: auto;
}

#selectFile {
  display: none;
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

#selectFile {
  width: 78px;
}

.hasCustomTrace .js-bundle-size, .hasCustomTrace .gzip-preview {
  display: none;
}

.mdl-button {
  background: 0 0;
  border: none;
  border-radius: 2px;
  color: #000;
  position: relative;
  margin: 0;
  min-width: 64px;
  /*padding: 0 16px;*/
  display: inline-block;
  font-family: "Roboto","Helvetica","Arial",sans-serif;
  font-size: 14px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0;
  overflow: hidden;
  will-change: box-shadow;
  transition: box-shadow .2s cubic-bezier(.4,0,1,1),background-color .2s cubic-bezier(.4,0,.2,1),color .2s cubic-bezier(.4,0,.2,1);
  /*outline: none;*/
  cursor: pointer;
  text-decoration: none;
  text-align: center;
  /*line-height: 36px;*/
  vertical-align: middle;
}

.mdl-button--raised.mdl-button--colored {
    background: rgb(255,235,59);
    color: rgb(66,66,66);
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
  .controls {
    text-align: left;
  }
  .advanced {
    float: right;
    padding: 5px;
  }
  select {
    background-color: white;
    border-width: 1px;
  }
  #uploadTimelineBtn {
    /*width: 100%;*/
    display: none;
  }
  #manager .dark {
    margin-top: 15px;
    padding-left: 2px;    
  }
}
</style>
