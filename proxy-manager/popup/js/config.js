let config

// -----------------------------------------------------------------------------
// helpers

function set_textarea_get_proxies_function_body_value(value) {
  set_text_field_value(get_textarea_get_proxies_function_body_element(), value)
}

function get_textarea_get_proxies_function_body_value() {
  return get_text_field_value(get_textarea_get_proxies_function_body_element())
}

function get_textarea_get_proxies_function_body_element() {
  return document.getElementById('textarea_get_proxies_function_body')
}

function is_edited_textarea_get_proxies_function_body_element() {
  return is_edited_field('get_proxies_function_body', '', get_textarea_get_proxies_function_body_value)
}

// -----------------------------------------------------------------------------

function set_checkbox_allow_fallback_value(value) {
  set_checkbox_field_value(get_checkbox_allow_fallback_element(), value)
}

function get_checkbox_allow_fallback_value() {
  return get_checkbox_field_value(get_checkbox_allow_fallback_element())
}

function get_checkbox_allow_fallback_element() {
  return document.getElementById('checkbox_allow_fallback')
}

function is_edited_checkbox_allow_fallback_element() {
  return is_edited_field('allow_fallback', true, get_checkbox_allow_fallback_value)
}

// -----------------------------------------------------------------------------

function set_checkbox_allow_fallback_prev_value(value) {
  set_checkbox_field_value(get_checkbox_allow_fallback_prev_element(), value)
}

function get_checkbox_allow_fallback_prev_value() {
  return get_checkbox_field_value(get_checkbox_allow_fallback_prev_element())
}

function get_checkbox_allow_fallback_prev_element() {
  return document.getElementById('checkbox_allow_fallback_prev')
}

function is_edited_checkbox_allow_fallback_prev_element() {
  return is_edited_field('allow_fallback_prev', true, get_checkbox_allow_fallback_prev_value)
}

// -----------------------------------------------------------------------------

function set_text_fallback_timeout_value(value) {
  set_text_field_value(get_text_fallback_timeout_element(), value)
}

function get_text_fallback_timeout_value() {
  return get_text_field_value(get_text_fallback_timeout_element())
}

function get_text_fallback_timeout_value_as_number() {
  return get_text_field_value_as_number(get_text_fallback_timeout_element(), 10)
}

function get_text_fallback_timeout_element() {
  return document.getElementById('text_fallback_timeout')
}

function is_edited_text_fallback_timeout_element() {
  return is_edited_field('fallback_timeout', '10', get_text_fallback_timeout_value)
}

// -----------------------------------------------------------------------------

function set_checkbox_proxy_dns_value(value) {
  set_checkbox_field_value(get_checkbox_proxy_dns_element(), value)
}

function get_checkbox_proxy_dns_value() {
  return get_checkbox_field_value(get_checkbox_proxy_dns_element())
}

function get_checkbox_proxy_dns_element() {
  return document.getElementById('checkbox_proxy_dns')
}

function is_edited_checkbox_proxy_dns_element() {
  return is_edited_field('proxy_dns', false, get_checkbox_proxy_dns_value)
}

// -----------------------------------------------------------------------------

function set_text_field_value(el, value) {
  if (!value) value = ''
  el.value = value
}

function get_text_field_value(el) {
  return el.value
}

function get_text_field_value_as_number(el, default_value = -1) {
  const num = parseInt(el.value, 10)
  return isNaN(num) ? default_value : num
}

// -----------------------------------------------------------------------------

function set_checkbox_field_value(el, value) {
  value = !!value
  el.checked = value
}

function get_checkbox_field_value(el) {
  return el.checked
}

// -----------------------------------------------------------------------------

function is_edited_field(key, default_value, getter) {
  const old_value = (config && (typeof config[key] !== 'undefined'))
    ? config[key]
    : default_value

  const new_value = getter()

  return (old_value !== new_value)
}

function is_edited() {
  return is_edited_textarea_get_proxies_function_body_element()
      || is_edited_checkbox_allow_fallback_element()
      || is_edited_checkbox_allow_fallback_prev_element()
      || is_edited_text_fallback_timeout_element()
      || is_edited_checkbox_proxy_dns_element()
}

// -----------------------------------------------------------------------------

function hide_block_elements_by_css_selector(css_selector) {
  update_display_style(css_selector, 'none')
}

function show_block_elements_by_css_selector(css_selector) {
  update_display_style(css_selector, 'block')
}

function update_display_style(css_selector, value) {
  document.querySelectorAll(css_selector).forEach(el => {el.style.display = value})
}

// -----------------------------------------------------------------------------

function update_requires_checkbox_allow_fallback() {
  const css_selector = '.requires_checkbox_allow_fallback'
  const show = get_checkbox_allow_fallback_value()
  const value = show ? 'block' : 'hide'

  update_display_style(css_selector, value)
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
  set_textarea_get_proxies_function_body_value(
    config.get_proxies_function_body
  )
  set_checkbox_allow_fallback_value(
    config.allow_fallback
  )
  set_checkbox_allow_fallback_prev_value(
    config.allow_fallback_prev
  )
  set_text_fallback_timeout_value(
    String(config.fallback_timeout)
  )
  set_checkbox_proxy_dns_value(
    config.proxy_dns
  )
}

function addFormFieldEventListeners() {
  get_checkbox_allow_fallback_element().addEventListener(
    'change',
    update_requires_checkbox_allow_fallback
  )

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
      config.allow_fallback            = get_checkbox_allow_fallback_value()
      config.allow_fallback_prev       = get_checkbox_allow_fallback_prev_value()
      config.fallback_timeout          = get_text_fallback_timeout_value_as_number()
      config.proxy_dns                 = get_checkbox_proxy_dns_value()

      storeInBrowserStorage({ config: JSON.stringify(config) }, function() {
        chrome.runtime.sendMessage({action: 'reload'})
        window.alert('OK: Configs are saved.')
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
