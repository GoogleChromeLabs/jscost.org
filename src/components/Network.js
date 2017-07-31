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

export default [{
  title: 'Custom',
  download: 0,
  latency: 0
}, {
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
