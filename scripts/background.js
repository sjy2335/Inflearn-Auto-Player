const lecturePage = "https://www.inflearn.com/courses/lecture";

chrome.runtime.onInstalled.addListener(() => {
  chrome.action.setBadgeText({
    text: "OFF",
  });
  chrome.action.setBadgeBackgroundColor({
    color: "red",
  });
  chrome.storage.local.set({ isOn: false });
});

chrome.storage.onChanged.addListener(async function (changes, namespace) {
  for (let key in changes) {
    if (key === "isOn") {
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        if (tabs.length > 0 && tabs[0].url.startsWith(lecturePage)) {
          let isOn = changes[key].newValue;
          console.log(`isOn changed into ${isOn}`);
          updateBadge(tabs[0].id, isOn);
          if (isOn) {
            callButtonScript();
          }
        }
      });
    }
  }
});

async function updateBadge(tabId, isOn) {
  const nextState = isOn ? " ON " : "OFF";
  let color = isOn ? "green" : "red"; // ON 상태일 때는 초록색, OFF 상태일 때는 빨간색
  // Set the action badge to the next state
  await chrome.action.setBadgeText({
    tabId: tabId,
    text: nextState,
  });
  await chrome.action.setBadgeBackgroundColor({
    tabId: tabId,
    color: color,
  });
}

function callButtonScript() {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    if (tabs.length > 0 && tabs[0].url.startsWith(lecturePage)) {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        function: pageContextScript,
      });
    }
  });
}

function pageContextScript() {
  let canClick = true;

  const findNextLectureButton = () => {
    const buttons = document.querySelectorAll("#video-end-overlay button");
    return Array.from(buttons).find((btn) =>
      btn.textContent.includes("다음 수업")
    );
  };

  const observer = new MutationObserver(() => {
    const overlay = document.querySelector("#video-end-overlay");
    const nextButton = findNextLectureButton();

    if (overlay && overlay.style.opacity === "1" && canClick && nextButton) {
      console.log("다음 수업 버튼 클릭");
      nextButton.click();

      canClick = false;
      setTimeout(() => {
        canClick = true;
      }, 3000);
    }
  });

  observer.observe(document.body, {
    attributes: true,
    childList: true,
    subtree: true,
  });
}
