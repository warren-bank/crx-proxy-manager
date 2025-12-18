### [Firefox addon: Proxy Manager](https://github.com/warren-bank/crx-proxy-manager)

#### Features

Allows the user to:

* Configure the methodology to dynamically obtain a fresh list of proxy servers.
  - intended only for advanced users
  - the default methodology works nicely
* Enable the use of a proxy for all tabs, or for individual tabs.
* Refresh the list of proxy servers.
* Switch the proxy in use to another in the list.

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
