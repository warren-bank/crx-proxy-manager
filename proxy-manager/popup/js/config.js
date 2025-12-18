let config

// -----------------------------------------------------------------------------
// helpers

function set_textarea_get_proxies_function_body_value(value) {
  if (!value) value = ''
  get_textarea_get_proxies_function_body_element().value = value
}

function get_textarea_get_proxies_function_body_value() {
  return get_textarea_get_proxies_function_body_element().value
}

function get_textarea_get_proxies_function_body_element() {
  return document.getElementById('textarea_get_proxies_function_body')
}

function is_edited() {
  const old_value = (config && config.get_proxies_function_body)
    ? config.get_proxies_function_body
    : ''

  const new_value = get_textarea_get_proxies_function_body_value()

  return (old_value !== new_value)
}

// -----------------------------------------------------------------------------
// unload

window.onbeforeunload = function(e) {
  if (is_edited()) {
    e.preventDefault()
    e.returnValue = true
    return 'Save changes before closing?'
  }
}

// -----------------------------------------------------------------------------
// load

window.onload = function() {
  initConfigurationPage()
}

function initConfigurationPage() {
  // load configuration from local storage
  loadFromBrowserStorage(['config'], function (result) {
    try {
      if (!result.config)
        throw 0

      config = JSON.parse(result.config)
    }
    catch(e) {
      config = {}
    }

    updateFormFieldValues()
    addFormFieldEventListeners()
  })
}

function updateFormFieldValues() {
  set_textarea_get_proxies_function_body_value(config.get_proxies_function_body)
}

function addFormFieldEventListeners() {
  document.getElementById('select_get_proxies_function_template').addEventListener(
    'change',
    function (e) {setTemplate(e.target.value)}
  )

  document.getElementById('save_button').addEventListener(
    'click',
    function (e) {saveData()}
  )
}

function saveData() {
  if (is_edited()) {
    try {
      config.get_proxies_function_body = get_textarea_get_proxies_function_body_value()
      storeInBrowserStorage({ config: JSON.stringify(config) }, function() {
        chrome.runtime.sendMessage({action: 'reload'})
      })
    }
    catch(error) {
      alert(error.message)
    }
  }
}

function setTemplate(value) {
  if (!value || !window.templates[value]) return
  set_textarea_get_proxies_function_body_value(window.templates[value])
}
