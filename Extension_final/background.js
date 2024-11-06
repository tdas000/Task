// background.js

// Block common Google tracking endpoints
const blockedUrls = [
    "*://*.google-analytics.com/*",
    "*://*.doubleclick.net/*",
    "*://*.googleadservices.com/*",
    "*://*.googlesyndication.com/*",
    "*://*.google.com/ads/*"
  ];  

// Block tracking requests to Google and its ad services
chrome.webRequest.onBeforeRequest.addListener(
    (details) => 
    {
        console.log("onBeforeRequest-Blocked: " + JSON.stringify(details));
        // chrome.storage.local.set({ lastIrreleventAlert: 
        //     `Irrelevant tracking endpoints detected at ${new Date().toLocaleTimeString()} 
        //     initiated by google.com to url: \"${details.url}\" which is blocked` });
        // chrome.action.setBadgeText({ text: "⚠️" });
        return { cancel: true };
    },
    { urls: blockedUrls },
    ["requestBody"]
  );

/***
 * utm_source: This specifies the source of the traffic. It shows where the user came from, such as "google," "facebook," or "newsletter." It helps track which platform or source is directing visitors to the website.
 *
 * utm_medium: This defines the medium through which the traffic arrived. For instance, it could be "email," "CPC" (Cost Per Click), "social," or "referral." It provides insight into the type of marketing channel that generated the visit.
 *
 * utm_campaign: This identifies the specific campaign that brought the user to the site. It’s often used to track performance across different marketing campaigns, such as "summer_sale" or "product_launch."
 *
 * gclid: Short for Google Click Identifier, this parameter is added to URLs when using Google Ads. It’s a unique tracking identifier that helps Google track the click source, allowing advertisers to measure conversions and attribute them to specific ads and keywords within Google Ads. 
 ***/ 
// Remove tracking parameters from Google Search URLs
chrome.webRequest.onBeforeRequest.addListener(
    (details) => {
      let url = new URL(details.url);
      //console.log("beforeRequest: " + JSON.stringify(url.searchParams));
      // Remove specific tracking parameters
      ["utm_source", "utm_medium", "utm_campaign", "gclid"].forEach(param => {
        url.searchParams.delete(param);
      });
      //console.log("beforeRequest2: " + JSON.stringify(url));
      //return { redirectUrl: url.toString() };
    },
    { urls: ["*://*.google.com/*"] },
    ["requestBody"]
);

// Restrict cookies by setting them to session-only or removing tracking cookies
// chrome.cookies.onChanged.addListener((changeInfo) => {
//    console.log("Cookie changed: " + JSON.stringify(changeInfo));
//     if (changeInfo.cookie.domain.includes("google.com")) {
//       const cookie = changeInfo.cookie;

//       //console.log("Cookie changed: " + JSON.stringify(cookie));
//       // Remove Google tracking cookies
//       if (["NID", "ANID", "_ga", "_gid", "1P_JAR"].includes(cookie.name)) {
//         console.log("Tracking Cookie found:  " + cookie.name);
//         chrome.cookies.remove({
//           url: "https://www.google.com" + cookie.path,
//           name: cookie.name
//         });
//       } else if (!cookie.session) {
//         // Set non-tracking cookies to session-only
//         chrome.cookies.set({
//           url: "https://www.google.com" + cookie.path,
//           name: cookie.name,
//           value: cookie.value,
//           domain: cookie.domain,
//           path: cookie.path,
//           expirationDate: Math.floor(Date.now() / 1000) + 3600 // 1-hour expiration
//         });
//       }
//     }
//   });
  
// List of keywords which is used for compare
const releventHeaderTerms = ["platform", "device_memory","device_factor", "os_bit", "os_arch", "os_version", "browser_version", "browser_color_scheme", "downlink", "ect", "user_agent"]

// API in Chrome extensions that allows you to intercept and modify HTTP request headers before 
// they are sent to the server. This can be useful for tasks like adding custom headers,
// modifying user-agent strings, or blocking requests based on specific criteria.
chrome.webRequest.onBeforeSendHeaders.addListener( 
    (details) => {
        //console.log("details: " + JSON.stringify(details));
        let data = extractOnBeforeSendHeadersData(details);
        let check = isIrrelevantHeaderIsSending(data);
        
        if(check) {
            //console.log("Check: " + check);
            chrome.storage.local.set({ lastIrreleventAlert: `Irrelevant data collection detected at ${new Date().toLocaleTimeString()} with data key: \"${discrepencyKey.key}\" value: ${discrepencyKey.value}` });
            chrome.action.setBadgeText({ text: "⚠️" });
        } else {
            chrome.storage.local.remove("lastIrreleventAlert", ()=>{
                chrome.action.setBadgeText({ text: "ⓘ" });
            });
            //console.log("Check: " + check);
            chrome.storage.local.set({relevantAlert: "No Irrelevant data is collected"});
        }
    },
    {urls:["*://*.google.com/*"]},
    ["requestHeaders"]
);

// Function is used for saving in local array variables which we got from "onBeforeSendHeaders"
function extractOnBeforeSendHeadersData(details) {
    const collectedData = {};
    details.requestHeaders.forEach( 
    (element) => {
        //console.log("Data: " + element.name + " value: " + element.value);
        if(element.name.toLowerCase() === "sec-ch-ua-platform") 
        {
            collectedData.platform = element.value;
        } else if(element.name.toLowerCase() === "device-memory") {
            collectedData.device_memory = element.value;
        } else if(element.name.toLowerCase() === "sec-ch-ua-form-factors") {
            collectedData.device_factor = element.value; // desktop or mobile
        } else if(element.name.toLowerCase() === "sec-ch-ua-bitness") {
            collectedData.os_bit = element.value;
        } else if(element.name.toLowerCase() === "sec-ch-ua-arch") {
            collectedData.os_arch = element.value;
        } else if(element.name.toLowerCase() === "sec-ch-ua-platform-version") {
            collectedData.os_version = element.value
        } else if(element.name.toLowerCase() === "sec-ch-ua-full-version") {
            collectedData.browser_version = element.value;
        } else if(element.name.toLowerCase() === "sec-ch-prefers-color-scheme") {
            collectedData.browser_color_scheme = element.value;
        } else if(element.name.toLowerCase() === "downlink") {
            collectedData.downlink = element.value; // downloadstream speed on agent
        } else if(element.name.toLowerCase() === "ect") {
            collectedData.ect = element.value; // network profile
        } else if(element.name.toLowerCase() === "user-agent") {
            collectedData.user_agent = element.value;
        }
    });
    
    //console.log("extracted Data: " + JSON.stringify(collectedData));
    chrome.storage.local.set({onbeforesendheaders: collectedData}, ()=> {
        //console.log("onbeforesendheaders data saved")
    });

    return collectedData;
}

// compare key with collected data from headers with relevant header data we have set
function isIrrelevantHeaderIsSending(data) { 
    for (const key in data) {
        if(!releventHeaderTerms.includes(key) ) {
            discrepencyKey.key = key;
            discrepencyKey.value = data[key];
            return true;
        }
    }
    return false;
}



