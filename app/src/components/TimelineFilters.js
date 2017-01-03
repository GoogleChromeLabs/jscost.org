export function _filterEventsForNavStart (e) {
  return e.categoriesString.includes('blink.user_timing') && e.name === 'navigationStart'
}

export function _filterEventsForLoadEventEnd (e) {
  return e.categoriesString.includes('blink.user_timing') && e.name === 'loadEventEnd'
}

export function _filterEventsForDomLoading (e) {
  return e.categoriesString.includes('blink.user_timing') && e.name === 'domLoading'
}

export function _filterEventsForDomComplete (e) {
  return e.categoriesString.includes('blink.user_timing') && e.name === 'domComplete'
}

export function _filterEventsForDomInteractive (e) {
  return e.categoriesString.includes('blink.user_timing') && e.name === 'domInteractive'
}

export function _filterEventsForFirstTextPaint (e) {
  return e.categoriesString.includes('blink.user_timing') && e.name === 'firstTextPaint'
}
