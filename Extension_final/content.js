let alertIsShowing = false;
let duration = 10000;

// getting alert data from chrome local storage 
// getting irrelevant data
chrome.storage.local.get("lastIrreleventAlert", ({ lastIrreleventAlert }) => {
    if (lastIrreleventAlert) {
      // Display GDPR Alert Banner
      const gdprAlert = document.createElement("div");
      gdprAlert.id = "gdpr-alert";
      gdprAlert.style.position = "fixed";
      gdprAlert.style.bottom = "0";
      gdprAlert.style.width = "100%";
      gdprAlert.style.backgroundColor = "red";
      gdprAlert.style.color = "white";
      gdprAlert.style.textAlign = "center";
      gdprAlert.style.padding = "10px";
      gdprAlert.innerHTML = `${lastIrreleventAlert}. Click for more details on <a href="https://policies.google.com/privacy">Privacy Policy.</a>`;
  
      document.body.appendChild(gdprAlert);
      alertIsShowing = true;
      setTimeout(()=> {
        gdprAlert.remove();
      }, duration);
    }
});

// getting alert if there is no irrelevant data is found
chrome.storage.local.get("relevantAlert", ({ relevantAlert }) => {
    if(relevantAlert && !alertIsShowing) {
      const gdprAlert = document.createElement("div");
      gdprAlert.id = "gdpr-alert";
      gdprAlert.style.position = "fixed";
      gdprAlert.style.bottom = "0";
      gdprAlert.style.width = "100%";
      gdprAlert.style.backgroundColor = "green";
      gdprAlert.style.color = "white";
      gdprAlert.style.textAlign = "center";
      gdprAlert.style.padding = "10px";
      gdprAlert.innerText = `${relevantAlert}.`;
  
      document.body.appendChild(gdprAlert);
      setTimeout(()=>{
        gdprAlert.remove();
      }, duration);
    }
});


