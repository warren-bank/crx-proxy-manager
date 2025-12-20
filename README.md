### [Firefox addon: Proxy Manager](https://github.com/warren-bank/moz-proxy-manager)

#### Features

Allows the user to:

* Configure the methodology to dynamically obtain a fresh list of proxy servers.
  - intended only for advanced users
  - the default methodology works nicely
* Enable the use of a proxy for all tabs, or for individual tabs.
* Refresh the list of proxy servers.
* Switch the proxy in use to another in the list.

#### Security

The default list of proxy servers is obtained from a publicly available list.

This has 2 important implications:

1. reliability
   - they don't always work
   - find a working proxy by:
     * allowing fallback to other proxies in list
       - which is default behavior
     * enable the proxy in a new tab
     * open the URL for a site that prints the IP of the HTTP client making the request
       - example: [httpbin.org/ip](https://httpbin.org/ip)
       - the IP it returns is the IP of a working proxy
     * select the working proxy in the list as the first proxy to use
2. security
   - don't pass any private information through these proxies without using an encrypted connection
   - don't ignore browser warnings for invalid HTTPS certificates
     * the proxy could be attempting to man-in-the-middle using a self-signed certificate

#### XPI Downloads

* direct: [./releases](https://github.com/warren-bank/moz-proxy-manager/releases)
* AMO: [addons.mozilla.org](https://addons.mozilla.org/en-US/firefox/addon/moz-proxy-manager/)

#### Similar Firefox addons

* [AutoProx](https://addons.mozilla.org/en-US/firefox/addon/autoprox/)
  - uses APIs that were removed entirely in Firefox 71
    * `browser.proxy.register()`
    * `browser.proxy.registerProxyScript()`
  - obtains free proxy servers from a site that no-longer exists
    * [gimmeproxy.com](http://gimmeproxy.com/api/getProxy)

#### Legal

* copyright: [Warren Bank](https://github.com/warren-bank)
* license: [GPL-2.0](https://www.gnu.org/licenses/old-licenses/gpl-2.0.txt)
