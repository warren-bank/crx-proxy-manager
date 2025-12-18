"use strict";

// -----------------------------------------------------------------------------
// hard-coded config values

const hc_config = {
  proxyDNS: false,
  failoverTimeout: 10,
  default_template: 'roundproxies'
}

// -----------------------------------------------------------------------------
// state management

let config
let started = 'off'
let active_tabs = {}
let active_tabs_count = 0
let get_proxies_function = null
let proxies = null
let proxy_index = -1

/*
* Initialize global state
*
*/
loadFromBrowserStorage(['config', 'started'], function (result) {
  if (result.config === undefined) {
    loadDefaultConfiguration()
  }
  else {
    try {
      started = result.started

      config = JSON.parse(result.config)

      if (!config || !config.get_proxies_function_body)
        throw 0
    }
    catch(e) {
      loadDefaultConfiguration()
    }
  }

  preProcessConfig()

  if (started === 'on') {
    start(true)
  }
  else if (started !== 'off') {
    started = 'off'
    storeInBrowserStorage({ started })
  }

  // listen for change in configuration or start/stop
  chrome.runtime.onMessage.addListener(notify)
})

function loadDefaultConfiguration() {
  console.log('Load default config')

  config = { get_proxies_function_body: window.templates[hc_config.default_template] }
  storeInBrowserStorage({ config: JSON.stringify(config) })
}

async function preProcessConfig() {
  try {
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/AsyncFunction
    // https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/content_security_policy
    const AsyncFunction = async function(){}.constructor

    get_proxies_function = new AsyncFunction(config.get_proxies_function_body)
  }
  catch(e) {
    get_proxies_function = null
  }
  await refreshProxies()
}

/*
* Listen for messages (from menu.js and config.js)
*
*/
function notify(message, sender, sendResponse) {
  if (!message || !(typeof message === 'object') || !message.action || !(typeof message.action === 'string'))
    return

  switch(message.action) {
    case 'reload': {
        loadFromBrowserStorage(['config'], function (result) {
          try {
            config = JSON.parse(result.config)
          }
          catch(e) {
            loadDefaultConfiguration()
          }
          preProcessConfig()
        })
      }
      break
    case 'on': {
        stopAllTabs()
        start()
      }
      break
    case 'off': {
        stop()
      }
      break
    case 'tab-on': {
        startActiveTab().then(sendResponse)
        return true
      }
      break
    case 'tab-off': {
        stopActiveTab().then(sendResponse)
        return true
      }
      break
    case 'is-tab-on': {
        isActiveTabStarted().then(sendResponse)
        return true
      }
      break
    case 'refresh_proxies': {
        refreshProxies().then(sendResponse)
        return true
      }
      break
    case 'prev_proxy': {
        prevProxy()
      }
      break
    case 'next_proxy': {
        nextProxy()
      }
      break
    case 'get-all-proxies': {
        sendResponse(proxies)
        return true
      }
      break
    case 'get-current-proxy': {
        sendResponse(getCurrentProxy())
        return true
      }
      break
  }
}

function start(skip_check) {
  if (!skip_check && (started === 'on'))
    return

  addListeners()
  started = 'on'
}

function stop(skip_check) {
  if (!skip_check && (started === 'off'))
    return

  removeListeners()
  started = 'off'
}

async function startActiveTab() {
  try {
    const id = await getActiveTabId()
    return startTab(id)
  }
  catch(e) {
    return false
  }
}

function startTab(id) {
  try {
    if (started === 'on') throw 0

    if (!!active_tabs[id])
      return true

    active_tabs[id] = true

    if (active_tabs_count === 0)
      addListeners()

    active_tabs_count += 1

    return true
  }
  catch(e) {
    return false
  }
}

async function stopActiveTab() {
  try {
    const id = await getActiveTabId()
    return stopTab(id)
  }
  catch(e) {
    return false
  }
}

function stopTab(id) {
  try {
    if (started === 'on') throw 0

    if (!active_tabs[id])
      return true

    delete active_tabs[id]
    active_tabs_count -= 1

    if (active_tabs_count === 0)
      removeListeners()

    return true
  }
  catch(e) {
    return false
  }
}

async function isActiveTabStarted() {
  try {
    const id = await getActiveTabId()
    return isTabStarted(id)
  }
  catch(e) {
    return false
  }
}

function isTabStarted(id) {
  try {
    if (started === 'on') throw 0

    return !!active_tabs[id]
  }
  catch(e) {
    return false
  }
}

function stopAllTabs() {
  active_tabs = {}
  active_tabs_count = 0
  removeListeners()
}

function getActiveTabId() {
  return new Promise((resolve, reject) => {
    chrome.tabs.query(
      {active: true, lastFocusedWindow: true},
      function(matching_tabs_array) {
        if (matching_tabs_array && Array.isArray(matching_tabs_array) && matching_tabs_array.length) {
          const tab = matching_tabs_array.find(tab => tab.id && (tab.id !== chrome.tabs.TAB_ID_NONE))

          if (tab) {
            resolve(String(tab.id))
            return
          }
        }
        reject()
      }
    )
  })
}

chrome.tabs.onRemoved.addListener(tabId => {
  stopTab(
    String(tabId)
  )
})

// -----------------------------------------------------------------------------
// plumbing

function addListeners() {
  browser.proxy.onRequest.addListener(
    proxyRequestListener,
    { urls: ['<all_urls>'] }
  )
}

function removeListeners() {
  browser.proxy.onRequest.removeListener(proxyRequestListener)
}

// -----------------------------------------------------------------------------
// business logic

async function refreshProxies() {
  try {
    if (!get_proxies_function) throw true
    proxies = await get_proxies_function()
    normalizeProxies()
    proxy_index = (Array.isArray(proxies) && proxies.length) ? 0 : -1
  }
  catch(e) {
    proxies = null
    proxy_index = -1
  }
}

function normalizeProxies() {
  if (Array.isArray(proxies)) {
    const types = ['http','https','socks','socks4']
    proxies = proxies.filter(proxy => proxy && (proxy instanceof Object) && proxy.type && proxy.host && proxy.port && types.includes(proxy.type) && (typeof proxy.host === 'string') && (typeof proxy.port === 'number') && (proxy.port > 0))

    if (!proxies.length)
      proxies = null
  }
  if (Array.isArray(proxies)) {
    for (let proxy of proxies) {
      normalizeProxy(proxy)
    }
  }
  else {
    normalizeProxy(proxies)
  }
}

function normalizeProxy(proxy) {
  if (proxy && (proxy instanceof Object)) {
    if (proxy.type && proxy.type.startsWith('socks')) {
      proxy.proxyDNS = hc_config.proxyDNS
    }
    proxy.failoverTimeout = hc_config.failoverTimeout
  }
}

function prevProxy() {
  if (proxy_index < 0) return

  proxy_index = (proxy_index - 1)
  if (proxy_index < 0)
    proxy_index = proxies.length - 1
}

function nextProxy() {
  if (proxy_index < 0) return

  proxy_index = (proxy_index + 1)
  if (proxy_index >= proxies.length)
    proxy_index = 0
}

function proxyRequestListener(details) {
  return ((started === 'on') || ((details.type !== 'speculative') && isTabStarted(String(details.tabId))))
    ? getCurrentProxies()
    : {type: 'direct'}
}

function getCurrentProxies() {
  return (proxy_index >= 0)
    ? [...proxies.slice(proxy_index), ...proxies.slice(0, proxy_index), null]
    : [proxies, null]
}

function getCurrentProxy() {
  return (proxy_index >= 0)
    ? proxies[proxy_index]
    : proxies
}
