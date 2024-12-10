const lecturePage = "https://www.inflearn.com/courses/lecture";

document.addEventListener("DOMContentLoaded", function () {
  let toggleButton = document.getElementById("toggleButton");

  // get initial state
  chrome.storage.local.get("isOn", function (data) {
    let isOn = data.isOn;
    toggleButton.textContent = isOn ? "Turn Off" : "Turn On";
  });

  // toggle
  toggleButton.addEventListener("click", function () {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      if (tabs.length > 0 && tabs[0].url.startsWith(lecturePage)) {
        chrome.storage.local.get("isOn", function (data) {
          let isOn = !data.isOn;
          toggleButton.textContent = isOn ? "Turn Off" : "Turn On";
          chrome.storage.local.set({ isOn: isOn });
        });
      }
    });
  });
});
