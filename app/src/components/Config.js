/**
 * @license
 * Copyright 2016 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import networkConditions from './Network.js'
import deviceConfig from './Devices.js'

export default {
  /* All synthetic benchmark timings are based on time to run 1048KB of 'average' JS */
  baseSize: 1048,
  /* Default JS bundle size target for the synthetic benchmark */
  bundleSizeBudget: 1200,
  gzippedBundleSize: 0,
  downloadSpeed: 750, // 3G
  devices: deviceConfig,
  /* Most developers are testing on desktop with a fast connection. */
  /* Default to DevTools Wifi configuration that most traces will likely be based on */
  network: networkConditions,
  networkSelected: '750', // 3G
  /* Target time the app should be interactive in. Chrome suggests < 5s */
  timeToInteractiveBudget: 5000
}
