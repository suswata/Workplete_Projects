// contentScript.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.message === 'analyze_page') {
      // Start scrolling
      setInterval(() => {
        window.scrollTo(0, document.body.scrollHeight);
      }, 2000);
  
      // Start analysis
      // ...
  
      // When analysis is done
      chrome.runtime.sendMessage({message: 'analysis_done'});
    }
  });

  function autoScroll() {
    window.scrollTo(0, document.body.scrollHeight);
}

// Scroll every 2 seconds
setInterval(autoScroll, 2000);