<template>
  <div id="app">
    <deviceManager></deviceManager>
  </div>
</template>

<script>
import DeviceManager from './components/DeviceManager'

export default {
  name: 'app',
  components: {
    DeviceManager
  }
}
</script>

<style>
#app {
  /*font-family: 'Avenir', Helvetica, Arial, sans-serif;*/
  font-family: '.SFNSDisplay-Regular', 'Helvetica Neue', 'Lucida Grande', sans-serif;
  font-size: 14px;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  /*margin-top: 60px;*/
}
body {
  margin: 0;
}
</style>
