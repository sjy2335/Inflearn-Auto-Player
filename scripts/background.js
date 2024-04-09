const lecturePage = "https://www.inflearn.com/course/lecture";

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
  let canObserve = true; // 강의 넘김 동작을 허용하는지 여부를 추적하는 전역 변수

  const nextLessonFlag = () => {
    return (
      document.querySelector(
        "#NextUnitModal-body > div.mantine-Group-root.mantine-qokdfp > button.mantine-UnstyledButton-root.mantine-Button-root.css-x644ap.mantine-3353zk"
      ) !== null
    );
  };

  const observer = new MutationObserver(function (mutationsList, observer) {
    if (nextLessonFlag() && canObserve) {
      // canObserve가 true일 때만 다음 강의로 넘어감
      clickNextLessonButton();
      observer.disconnect(); // 현재의 observer를 중지
      canObserve = false; // 다음 동작을 방지
      setTimeout(() => {
        canObserve = true; // 3초 후에 다시 강의 넘김 동작을 허용
        observer.observe(document, { childList: true, subtree: true }); // observer를 다시 시작
      }, 3000); // 3초 대기
    }
  });

  observer.observe(document, { childList: true, subtree: true });

  function clickNextLessonButton() {
    console.log("next lecture button clicked.");
    const nextLessonButton = document.querySelector(
      "#NextUnitModal-body > div.mantine-Group-root.mantine-qokdfp > button.mantine-UnstyledButton-root.mantine-Button-root.css-x644ap.mantine-3353zk"
    );
    if (nextLessonButton) {
      nextLessonButton.click();
    }
  }
}
