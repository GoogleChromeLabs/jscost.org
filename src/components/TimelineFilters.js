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

// Thanks to Paul Irish for helping me figure out how to filter these babies down correctly <3
let ourframe

export function setFrameId (id) {
  ourframe = id
}

export function _filterEventsForNavStart (e) {
  return e.categoriesString.includes('blink.user_timing') && e.name === 'navigationStart' && e.args.frame === ourframe
}

export function _filterEventsForLoadEventEnd (e) {
  return e.categoriesString.includes('blink.user_timing') && e.name === 'loadEventEnd' && e.args.frame === ourframe
}

export function _filterEventsForFetchStart (e) {
  return e.categoriesString.includes('blink.user_timing') && e.name === 'fetchStart' && e.args.frame === ourframe
}

export function _filterEventsForDomLoading (e) {
  return e.categoriesString.includes('blink.user_timing') && e.name === 'domLoading' && e.args.frame === ourframe
}

export function _filterEventsForDomComplete (e) {
  return e.categoriesString.includes('blink.user_timing') && e.name === 'domComplete' && e.args.frame === ourframe
}

export function _filterEventsForDomContentLoadedEventEnd (e) {
  return e.categoriesString.includes('blink.user_timing') && e.name === 'domContentLoadedEventEnd' && e.args.frame === ourframe
}

export function _filterEventsForDomInteractive (e) {
  return e.categoriesString.includes('blink.user_timing') && e.name === 'domInteractive' && e.args.frame === ourframe
}

export function _filterEventsForFirstTextPaint (e) {
  return e.categoriesString.includes('devtools.timeline') && e.name === 'firstTextPaint' && e.args.frame === ourframe
}
