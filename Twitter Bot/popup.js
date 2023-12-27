document.getElementById('analyze-button').addEventListener('click', () => {
    document.getElementById('status').textContent = 'Analyzing data...';
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, {message: 'analyze_page'});
    });
  });

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.message === 'analysis_done') {
      document.getElementById('status').textContent = 'Analysis complete.';
    }
  });