let mainForm,
  statusBox,
  availableProxiesSelect,
  activeProxiesSelect,
  addButton,
  removeButton,
  saveButton,
  searchInput,
  customForm,
  customNameInput,
  customURLInput,
  customAddButton;

const availableProxies = new Map();
const availableProxies_redirect = new Map();
const activeProxies = new Map();
const activeProxies_redirect = new Map();

async function main() {
  statusBox = document.getElementById("status");

  mainForm = document.getElementById("main-form");
  availableProxiesSelect = document.getElementById("available-proxies");
  activeProxiesSelect = document.getElementById("active-proxies");
  addButton = document.getElementById("add-button");
  removeButton = document.getElementById("remove-button");
  searchInput = document.getElementById("search");
  saveButton = document.getElementById("save-button");

  customForm = document.getElementById("custom-form");
  customNameInput = document.getElementById("custom-name");
  customURLInput = document.getElementById("custom-url");
  customAddButton = document.getElementById("custom-add");

  mainForm.addEventListener("submit", onFormSubmit);
  addButton.addEventListener("click", onAddClick);
  removeButton.addEventListener("click", onRemoveClick);
  searchInput.addEventListener("input", updateLists);

  customForm.addEventListener("submit", onCustomSubmit);

  setFormDisabled(true);

  await updateProxies();
  await restoreOptions();

  updateLists();

  setFormDisabled(false);
}

function setStatus(text) {
  statusBox.innerText = text;
}

function setFormDisabled(disabled) {
  const inputs = [
    availableProxiesSelect,
    activeProxiesSelect,
    addButton,
    removeButton,
    searchInput,
    saveButton,
    customNameInput,
    customURLInput,
    customAddButton,
  ];
  for (let input of inputs) {
    input.disabled = disabled;
  }
}

async function restoreOptions() {
  const proxies = await loadProxies();
  activeProxies.clear();
  for (const { url, name } of proxies) {
    activeProxies.set(url, name);
  }
  const proxies_redirect = await loadProxies_redirect();
  activeProxies_redirect.clear();
  for (var key in proxies_redirect) {
    activeProxies_redirect.set(key, proxies_redirect[key]);
  }
}

function onAddClick() {
  for (let option of availableProxiesSelect.selectedOptions) {
    // option.text is the university name
    activeProxies.set(option.value, option.text);
    // var url = availableProxies_redirect.get(option.text);
    console.log("availableProxies_redirect", availableProxies_redirect);
    console.log("option.text", option.text);
    console.log("option.value", option.value);
    console.log(
      "availableProxies_redirect.get(option.text)",
      availableProxies_redirect.get(option.text)
    );
    activeProxies_redirect.set(
      option.text,
      availableProxies_redirect.get(option.text)
    );
  }

  availableProxiesSelect.selectedIndex = -1;
  searchInput.value = "";

  updateLists();
}

function onRemoveClick() {
  for (let option of activeProxiesSelect.selectedOptions) {
    activeProxies.delete(option.value);
    activeProxies_redirect.delete(option.text);
  }
  activeProxiesSelect.selectedIndex = -1;
  updateLists();
}

async function onFormSubmit(evt) {
  evt.preventDefault();
  setFormDisabled();
  setStatus("Saving options...");

  const proxies = [];
  for (const [url, name] of activeProxies.entries()) {
    proxies.push({ name, url });
  }
  console.log("onFormSubmit-> activeProxies_redirect", activeProxies_redirect);
  console.log("onFormSubmit-> proxies", proxies);
  const proxies2 = new Map();
  for (var [uni_name, proxy_map] of activeProxies_redirect) {
    console.log("onFormSubmit-> key", uni_name);
    console.log("onFormSubmit-> activeProxies_redirect[key]", proxy_map);
    proxies2.set(uni_name, proxy_map);
  }
  console.log("proxies2", proxies2);

  try {
    await saveProxies(proxies);
  } catch (err) {
    console.error("failed to save options:", err);
    setStatus("Failed to save options. Please try again later.");
    return;
  } finally {
    setFormDisabled(false);
  }

  try {
    await saveProxies_redirect(proxies2);
  } catch (err) {
    console.error("failed to save options: activeProxies_redirect", err);
    setStatus(
      "Failed to save options activeProxies_redirect. Please try again later."
    );
    return;
  } finally {
    setFormDisabled(false);
  }
  const a = await loadProxies_redirect();
  console.log("onFormsubmit-> a", a);
  setStatus("Options saved successfully.");
}

function onCustomSubmit(evt) {
  evt.preventDefault();

  const name = customNameInput.value.trim();
  const url = customURLInput.value.trim();

  if (name.length === 0 || url.length === 0) {
    return;
  }

  activeProxies.set(url, name);

  customNameInput.value = "";
  customURLInput.value = "";

  updateLists();
}

async function updateProxies() {
  setStatus("Updating list of proxies...");

  let proxies;
  try {
    const response = await fetch(
      "https://raw.githubusercontent.com/FindHao/redirect_scholar/master/proxies.json"
    );
    proxies = await response.json();
    console.log(proxies);
  } catch (err) {
    setStatus("Failed to update list of proxies. Please try again later.");
    return;
  }

  let proxies_redirect;
  try {
    const response = await fetch(
      "https://raw.githubusercontent.com/FindHao/redirect_scholar/master/proxies_redirect.json"
    );
    proxies_redirect = await response.json();
    console.log("proxies_redirect", proxies_redirect);
  } catch (err) {
    setStatus(
      "Failed to update list of proxies_redirect. Please try again later."
    );
    return;
  }

  availableProxies.clear();
  for (const { url, name } of proxies) {
    availableProxies.set(url, name);
  }
  console.log("availableProxies", availableProxies);

  availableProxies_redirect.clear();
  console.log("proxies_redirect", proxies_redirect);
  // the format of availableProxies_redirect is the same with proxy_redirect.json
  for (var key in proxies_redirect) {
    console.log("key", key);
    console.log("proxies_redirect[key]", proxies_redirect[key]);
    console.log("type: ", typeof proxies_redirect[key]);
    const tmp = new Map();
    for (var key2 in proxies_redirect[key]) {
      tmp.set(key2, proxies_redirect[key][key2]);
    }
    availableProxies_redirect.set(key, tmp);
  }
  console.log("availableProxies_redirect", availableProxies_redirect);
  setStatus("Proxy list updated.");
}

function updateLists() {
  clearSelect(availableProxiesSelect);
  clearSelect(activeProxiesSelect);

  for (let [url, name] of availableProxies.entries()) {
    // Filter out active proxies.
    if (activeProxies.has(url)) {
      continue;
    }

    // Apply any search term
    const searchTerm = searchInput.value.trim().toLowerCase();
    const haystack = name.toLowerCase();
    if (searchTerm && haystack.indexOf(searchTerm) === -1) {
      continue;
    }

    addOption(availableProxiesSelect, name, url);
  }
  console.log("updateLists-> activeProxies", activeProxies);
  console.log("updateLists-> activeProxies_redirect", activeProxies_redirect);
  for (let [url, name] of activeProxies.entries()) {
    addOption(activeProxiesSelect, name, url);
  }
}

function clearSelect(select) {
  for (let i = select.length - 1; i >= 0; i--) {
    select.remove(i);
  }
}

function addOption(select, name, url) {
  const option = document.createElement("option");

  option.text = name;
  option.value = url;
  option.title = `${name} - ${url}`;

  select.add(option, null);
}

switch (document.readyState) {
  case "interactive":
  case "complete":
    main();
    break;

  default:
    document.addEventListener("DOMContentLoaded", main);
    break;
}
