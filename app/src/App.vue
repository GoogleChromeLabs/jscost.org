<template>
  <div id="app">
    <div class="header-cont">
        <div class="header">
          <img id="logo" src="/static/logo.png"/>
        </div>
    </div>    
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
  margin-top: 50px;
}
body {
  margin: 0;
}
/* headers */
.header-cont {
    width:100%;
    position:fixed;
    top:0px;
    right: 0;
    left: 0; 
    z-index: 999;
}
.header {
    height:50px;
    background:#333333;
    width:100%;
    margin:0px auto;
    color: white;
}

#logo {
    font-weight: bold;
    font-size: 18px;
    padding-top: 14px;
    width: 90px;
}
</style>
