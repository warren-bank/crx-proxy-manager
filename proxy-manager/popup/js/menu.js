let started = "off"
let tab_started = "off"
let visible = null

window.onload = function() {
  document.getElementById('refresh_proxies').addEventListener('click', function(e) {
    chrome.runtime.sendMessage({action: 'refresh_proxies'}, function() {
      if (visible === 'all') show_all()
      if (visible === 'current') show_current()
    })
  })

  document.getElementById('prev_proxy').addEventListener('click', function(e) {
    chrome.runtime.sendMessage({action: 'prev_proxy'})
    if (visible === 'current') show_current()
  })

  document.getElementById('next_proxy').addEventListener('click', function(e) {
    chrome.runtime.sendMessage({action: 'next_proxy'})
    if (visible === 'current') show_current()
  })

  document.getElementById('config').addEventListener('click', function(e) {
    start_config()
  })

  document.getElementById('show_all').addEventListener('click', function(e) {
    if (visible === 'all') {
      hide_info()
    }
    else {
      hide_info()
      show_all()
      e.target.value = e.target.value.replace('Show', 'Hide')
      visible = 'all'
    }
  })

  document.getElementById('show_current').addEventListener('click', function(e) {
    if (visible === 'current') {
      hide_info()
    }
    else {
      hide_info()
      show_current()
      e.target.value = e.target.value.replace('Show', 'Hide')
      visible = 'current'
    }
  })

  loadFromBrowserStorage(['started'], function(result) {
    started = result.started

    const start_stop      = document.getElementById('start_stop')
    const start_stop_tab  = document.getElementById('start_stop_tab')

    if (started === "on") {
      start_stop.value = "Stop"

      start_stop_tab.disabled = true
    }
    else {
      chrome.runtime.sendMessage({action: 'is-tab-on'}, function(response) {
        if (response) {
          tab_started = "on"
          start_stop_tab.value = "Stop Tab"
        }
      })
    }

    start_stop.addEventListener('click', function(e) {onclick_start_stop()})
    start_stop_tab.addEventListener('click', function(e) {onclick_start_stop_tab()})
  })
}

function onclick_start_stop() {
  const start_stop     = document.getElementById('start_stop')
  const start_stop_tab = document.getElementById('start_stop_tab')

  if (started === "off") {
    storeInBrowserStorage({started: 'on'}, function() {
      chrome.runtime.sendMessage({action: 'on'})
      started = "on"
      start_stop.value = "Stop"

      if (tab_started === "on") {
        tab_started = "off"
        start_stop_tab.value = "Start Tab"
      }
      start_stop_tab.disabled = true

      // if exists reload config tab , to get the start/stop information correct
      chrome.tabs.query({currentWindow: true}, reloadConfigTab)
    })
  }
  else {
    storeInBrowserStorage({started: 'off'}, function() {
      chrome.runtime.sendMessage({action: 'off'})
      started = "off"
      start_stop.value = "Start"

      start_stop_tab.disabled = false

      // if exists reload config tab , to get the start/stop information correct
      chrome.tabs.query({currentWindow: true}, reloadConfigTab)
    })
  }
}

function onclick_start_stop_tab() {
  const start_stop_tab = document.getElementById('start_stop_tab')

  if (start_stop_tab.disabled)
    return

  if (tab_started === "off") {
    chrome.runtime.sendMessage({action: 'tab-on'}, function(response) {
      if (response !== true) return

      tab_started = "on"
      start_stop_tab.value = "Stop Tab"
    })
  }
  else {
    chrome.runtime.sendMessage({action: 'tab-off'}, function(response) {
      if (response !== true) return

      tab_started = "off"
      start_stop_tab.value = "Start Tab"
    })
  }
}

function reloadConfigTab(tabs)  {
  let config_tab
  // search for config tab
  for (let tab of tabs)  {
    if (tab.url.startsWith(chrome.extension.getURL(""))) config_tab = tab
  }
  // config tab exists , reload it
  if (config_tab) chrome.tabs.reload(config_tab.id)
}

function start_config()  {
  chrome.tabs.query({currentWindow: true}, loadConfigTab)
}

function loadConfigTab(tabs)  {
  let config_tab
  // search for config tab
  for (let tab of tabs)  {
    if (tab.url.startsWith(chrome.extension.getURL(""))) config_tab = tab
  }
  // config tab exits , put the focus on it
  if (config_tab) chrome.tabs.update(config_tab.id, {active:true})
  // else create a new tab
  else chrome.tabs.create({url:"/popup/config.html"})
}

function show_all() {
  chrome.runtime.sendMessage({action: 'get-all-proxies'}, function(response) {
    if (response) {
      show_info(JSON.stringify(response, null, 2))
    }
  })
}

function show_current() {
  chrome.runtime.sendMessage({action: 'get-current-proxy'}, function(response) {
    if (response) {
      show_info(JSON.stringify(response, null, 2))
    }
  })
}

function show_info(text) {
  document.querySelector('#show_info > pre').textContent = text
}

function hide_info() {
  show_info('')
  visible = null

  let btn
  btn = document.getElementById('show_all')
  btn.value = btn.value.replace('Hide', 'Show')
  btn = document.getElementById('show_current')
  btn.value = btn.value.replace('Hide', 'Show')
}
