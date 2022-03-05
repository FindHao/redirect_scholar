function replacer(key, value) {
  if (value instanceof Map) {
    return {
      dataType: "Map",
      value: Array.from(value.entries()), // or with spread: value: [...value]
    };
  } else {
    return value;
  }
}

function reviver(key, value) {
  if (typeof value === "object" && value !== null) {
    if (value.dataType === "Map") {
      return new Map(value.value);
    }
  }
  return value;
}

function saveProxies(proxies) {
  // browser.storage.local.set({"proxies": proxies});
  return browser.storage.sync.set({ proxies });
}

function saveProxies_redirect(proxies_redirect) {
  // browser.storage.local.set({ "proxies_redirect": proxies });
  if(proxies_redirect.size === 0) {
    return;
  }
  const astr = JSON.stringify(proxies_redirect, replacer);
  return browser.storage.sync.set( { proxies_redirect: astr } );
}

async function loadProxies() {
  const items = await browser.storage.sync.get("proxies");
  return items.proxies || [];
}

// function loadProxies_sync() {
//   const items = browser.storage.local.get("proxies");
//   console.log("loadProxies_sync", items);
//   return items || []
// }

// for the specific proxy domains such as ieee proxy
async function loadProxies_redirect() {
  const items_raw = await browser.storage.sync.get("proxies_redirect");
  console.log("loadProxies_redirect-> ", items_raw);
  if (JSON.stringify(items_raw) === "{}") {
    return new Map();
  }
  const items = JSON.parse(items_raw["proxies_redirect"], reviver);
  console.log("loadProxies_redirect-> items", items);
  return items;
}
// // sync version
// function loadProxies_redirect_sync() {
//   const items = browser.storage.local.get("proxies_redirect");
//   console.log("loadProxies_redirect_sync", items);
//   return items || {};
// }

function transformURL(url, proxy) {
  if (proxy.indexOf("$@") === -1) {
    throw new Error("proxy missing replacement token");
  }
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    throw new Error("not proxying http or https");
  }
  return proxy.replace("$@", url);
}

async function openNewTab(url) {
  browser.tabs.create({ url });
}

async function reloadTab(tab, url) {
  browser.tabs.update(tab.id, { url });
}

function copyText(text) {
  const input = document.createElement("input");
  try {
    document.body.appendChild(input);

    input.value = text;
    input.focus();
    input.select();

    document.execCommand("copy");
  } finally {
    input.remove();
  }
}
