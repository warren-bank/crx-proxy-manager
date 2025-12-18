window.templates = {
  "roundproxies": `
// https://roundproxies.com/free-proxy-list/

const url = 'https://roundproxies.com/api/get-free-proxies?limit=100&page=1&sort_by=lastChecked&sort_type=desc&protocols=socks4%2Csocks5&uptime=high'

let response
response = await fetch(url)
response = await response.json()

let proxies
if (response && (response instanceof Object) && Array.isArray(response.data) && response.data.length) {
  proxies = response.data
  proxies = proxies.map(proxy => {
    if (!proxy || !(proxy instanceof Object) || !Array.isArray(proxy.protocols) || !proxy.protocols.length || !proxy.ip || !proxy.port)
      return null

    let type = proxy.protocols[0].toLowerCase()
    let host = proxy.ip
    let port = parseInt(proxy.port, 10)

    if (type === 'socks5')
      type = 'socks'

    if (!['http','https','socks','socks4'].includes(type))
      return null
    if (isNaN(port) || (port <= 0))
      return null

    return {type, host, port}
  })
  proxies = proxies.filter(proxy => !!proxy)
}
if (!proxies || !Array.isArray(proxies) || !proxies.length) {
  proxies = null
}
return proxies
`,

  "pubproxy": `
// http://pubproxy.com/#settings

const url = 'http://pubproxy.com/api/proxy?limit=100&format=json&last_check=60&speed=10&country=US,CA'

let response
response = await fetch(url)
response = await response.json()

let proxies
if (response && (response instanceof Object) && Array.isArray(response.data) && response.data.length) {
  proxies = response.data
  proxies = proxies.map(proxy => {
    if (!proxy || !(proxy instanceof Object) || !proxy.type || !proxy.ip || !proxy.port)
      return null

    let type = proxy.type.toLowerCase()
    let host = proxy.ip
    let port = parseInt(proxy.port, 10)

    if (type === 'socks5')
      type = 'socks'

    if (!['http','https','socks','socks4'].includes(type))
      return null
    if (isNaN(port) || (port <= 0))
      return null

    return {type, host, port}
  })
  proxies = proxies.filter(proxy => !!proxy)
}
if (!proxies || !Array.isArray(proxies) || !proxies.length) {
  proxies = null
}
return proxies
`,

  "localhost": `
// https://www.telerik.com/fiddler/fiddler-classic
// https://www.telerik.com/support/fiddler-classic
// https://www.telerik.com/fiddler/fiddler-classic/documentation/configure-fiddler/capturing-traffic/configurebrowsers

return {type: 'http', host: '127.0.0.1', port: 8888}
`
}
