function tryImport(...fileNames) {
  try {
    importScripts(...fileNames);
    return true;
  } catch (e) {
    console.error(e);
  }
}

self.oninstall = () => {
  tryImport("/shared.js");
};

async function migrate() {
  const items = await browser.storage.sync.get(["proxies", "base_url"]);
  if (items.proxies) {
    console.info("up to date");
    // We are up to date.
    return;
  }

  if (items.base_url) {
    console.info("migrated from base_url");
    // Migrate to new format.
    await saveProxies([{ name: items.base_url, url: items.base_url }]);
    await browser.storage.sync.remove("base_url");
    return;
  }

  if (browser.storage.local.base_url) {
    console.info("migrated from localStorage base_url");
    // Migrate to new format.
    await saveProxies([
      {
        name: browser.storage.local.base_url,
        url: browser.storage.local.base_url,
      },
    ]);
    delete browser.storage.local.base_url;
    return;
  }

  console.info("no stored data");
}

async function updateMenus() {
  browser.contextMenus.removeAll();
  browser.action.setPopup({ popup: "" });

  const proxies = await loadProxies();

  if (proxies.length === 0) {
    return;
  }

  browser.contextMenus.create({
    id: "reload",
    title: "Reload page",
    contexts: ["browser_action", "page"],
    documentUrlPatterns: ["http://*/*", "https://*/*"],
  });

  browser.contextMenus.create({
    id: "open",
    title: "Open link",
    contexts: ["link"],
  });

  browser.contextMenus.create({
    id: "open_new",
    title: "Open link in new tab",
    contexts: ["link"],
  });

  // Copying and permissions doesn't work from background pages in Firefox, so
  // just hide the copy menu item for now.
  //   https://bugzilla.mozilla.org/show_bug.cgi?id=1422605
  //   https://bugzilla.mozilla.org/show_bug.cgi?id=1272869
  //
  // Also, Chrome doesn't have the getBrowserInfo method right now (Chrome 67).
  let canCopy = true;
  if (browser.runtime.getBrowserInfo) {
    const info = await browser.runtime.getBrowserInfo();
    canCopy = info.name !== "Firefox";
  }

  if (canCopy) {
    browser.contextMenus.create({
      id: "copy",
      title: "Copy URL to clipboard",
      contexts: ["browser_action", "link"],
    });
  }

  if (proxies.length > 1) {
    browser.action.setPopup({
      popup: browser.extension.getURL("popup.html"),
    });

    for (const proxy of proxies) {
      browser.contextMenus.create({
        parentId: "reload",
        id: `1.${proxy.url}`,
        title: proxy.name,
        contexts: ["browser_action", "page"],
      });

      browser.contextMenus.create({
        parentId: "open",
        id: `2.${proxy.url}`,
        title: proxy.name,
        contexts: ["link"],
      });

      browser.contextMenus.create({
        parentId: "open_new",
        id: `3.${proxy.url}`,
        title: proxy.name,
        contexts: ["link"],
      });

      if (canCopy) {
        browser.contextMenus.create({
          parentId: "copy",
          id: `4.${proxy.url}`,
          title: proxy.name,
          contexts: ["browser_action", "link"],
        });
      }
    }
  }
}

async function urlFromMenuInfo(info) {
  // If a top-level menu item was clicked, return the first proxy.
  if (!info.parentMenuItemId) {
    const proxies = await loadProxies();
    if (proxies.length === 0) {
      throw new Error("no proxy defined");
    }
    return proxies[0].url;
  }

  // Otherwise, the URL is encoded in the sub-menu ID. Slice off the digit
  // prefix to recover.
  return info.menuItemId.substr(2);
}

if (typeof browser === "undefined") {
  var browser = chrome;
}
// the domains we want to redirect
let urls = [
  "ieeexplore.ieee.org", 
"dl.acm.org"];
// the key is the domain name in urls, and the value is the corresponding code in proxies_redirect.json
let url_map = { "ieeexplore.ieee.org": "ieee", "dl.acm.org": "acm", "link.springer.com": "springer" };

async function redirect_rule(details) {
  // it is a list
  const proxies = await loadProxies();
  if (proxies.length === 0) {
    console.log("redirect_rule-> no proxy definied");
    return {};
  }
  // it is a Map
  const proxies_redirect = await loadProxies_redirect();
  console.log("redirect_rule-> proxies:", proxies);
  console.log("redirect_rule-> proxies_redirect:", proxies_redirect);
  if (proxies_redirect.size !== 0) {
    var university_name = proxies[0].name;
    var proxies_map = proxies_redirect.get(university_name);
    urls.forEach((domain, index) => {
      let id = index + 1;
      console.log(domain, index);
      var short_code = url_map[domain];
      var target_proxy = proxies_map.get(short_code);
      console.log("redirect_rule-> target_proxy:", target_proxy);
      if (target_proxy) {
        chrome.declarativeNetRequest.updateDynamicRules({
          addRules: [
            {
              id: id,
              priority: 1,
              action: {
                type: "redirect",
                redirect: { regexSubstitution: target_proxy },
              },
              condition: {
                regexFilter: domain,
                resourceTypes: ["xmlhttprequest", "main_frame"],
                excludedDomains: [
                  "*://ieeexplore.ieee.org/document/null*",
                  "*://dl.acm.org/null*",
                  "*://dl.acm.org/*null*",
                  "*://dl.acm.org/doi/abs/*/null*",
                  "*://link.springer.com/null*"
                ],
              },
            },
          ],
          removeRuleIds: [id],
        });
      }
    });
  } else {
    console.log("redirect_rule-> no proxy definied");
  }
}

browser.runtime.onInstalled.addListener(async (details) => {
  console.info("onInstalled");
  await redirect_rule();
  await migrate();
  await updateMenus();
});

browser.storage.onChanged.addListener(async (changes) => {
  await updateMenus();
  await redirect_rule();
});

browser.action.onClicked.addListener(async (tab) => {
  const proxies = await loadProxies();
  if (proxies.length === 0) {
    browser.runtime.openOptionsPage();
    return;
  }

  const proxy = proxies[0].url;
  const oldURL = tab.url;
  const newURL = transformURL(oldURL, proxy);

  reloadTab(tab, newURL);
});

browser.contextMenus.onClicked.addListener(async (info, tab) => {
  const menuID = info.parentMenuItemId || info.menuItemId;
  const oldURL = info.linkUrl || tab.url;

  const proxy = await urlFromMenuInfo(info);
  const newURL = transformURL(oldURL, proxy);

  switch (menuID) {
    case "reload":
    case "open":
      reloadTab(tab, newURL);
      break;

    case "open_new":
      openNewTab(newURL);
      break;

    case "copy":
      const permissions = ["clipboardWrite"];
      browser.permissions.request({ permissions }, (granted) => {
        if (!granted) {
          console.warn("copy permission denied");
          return;
        }
        copyText(newURL);
      });
      break;
  }
});
