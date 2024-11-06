
// List of sensitive keywords
const sensitiveKeywords = ["password", "confidential", "credit card", "social security number", "private", "secret"];

// Function to check for sensitive words in the input
function checkForSensitiveWords(inputText) {
  return sensitiveKeywords.some(keyword => inputText.toLowerCase().includes(keyword));
}
console.log("Extension loaded. Monitoring search input...");

//Function to monitor the search input field
function monitorSearchInput(searchInput) {
    console.log("Entered monitorSearchInput: " , searchInput);
    
    searchInput.addEventListener('input', (event) => {
      const userInput = event.target.value;
      console.log("User typed:", userInput); // Debugging statement
  
      // Check if any sensitive keyword is present in the user input
      /**
       * regex: /\w+[.!?]?$/
       * operation: 
       *           1. \w+:
       *                 \w matches any word character, which includes letters (a–z, A–Z), digits (0–9), and the underscore (_).
       *                 The + quantifier means "one or more" of these characters. So, \w+ matches a sequence of one or more word characters.
       *           2. [.!?]?:
       *                 The square brackets [.!?] create a character class that matches any one of the characters inside it: a period (.), exclamation mark (!), or question mark (?).
       *                 The ? following the character class makes this part optional, meaning it matches zero or one occurrence of any of these punctuation characters.
       *           3. $:
       *                The dollar sign ($) anchors the match to the end of the line or string. It ensures that the matched pattern must appear at the end of the input.
       */
      if (checkForSensitiveWords(userInput)) {
        //console.warn("Sensitive information detected:", userInput);
        //alert("Sensitive information detected in your search!");
        let text = `Sensitive information detected: \"${userInput.match(/\w+[.!?]?$/)}\" \nDo you want us to keep this?`;
        if (confirm(text) == true) {
          console.log("Do nothing");
        } else {
          event.target.value = userInput.replace(/\w+[.!?]?$/, ''); 
        }
      }
    });
  }
  
  // Use MutationObserver to detect when the input element is added
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.type === 'childList') {
        const searchInput = document.querySelector("textarea[name='q']");

        if (searchInput) {
          console.log("Search input found, adding event listener.", searchInput); // Debugging statement
          monitorSearchInput(searchInput);
          observer.disconnect(); // Stop observing once input is found
        }
      }
    });
  });
  
  // Start observing the document for changes
  observer.observe(document.body, { childList: true, subtree: true });