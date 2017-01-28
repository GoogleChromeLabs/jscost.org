<template>
  <div id="app">
    <div class="header-cont">
        <div class="header">
          <img id="logo" src="/static/logo.svg"/>
          <span>A JavaScript cost visualization tool</span>
        </div>
    </div>    
    <deviceManager id="manager"></deviceManager>
    <footer>Built with 💜 by <a href='https://twitter.com/addyosmani'>Addy Osmani</a></footer>
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
    /*height:75px;*/
    background:#333333;
    width:100%;
    margin:0px auto;
    color: white;
}
.header span {
  display: block;
  height: 23px;
}
#manager .dark {
  margin-top: 10px;
}
#logo {
    font-weight: bold;
    font-size: 18px;
    padding-top: 10px;
    width: 90px;
}
footer {
  padding: 50px;
  font-size: 1.1em;
}

footer a {
  text-decoration: none;
  font-weight: 700;
  color: #666;
}
</style>
