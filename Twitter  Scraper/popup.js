// This function will be injected and executed in the context of the webpage
//##############################################TWITTER SCRAPPING##################################
let screenshotUrls = [];
function scrapeTwitter() {
  // Function to simulate scrolling
  function scrollPage() {
    window.scrollBy(0, window.innerHeight);
  }

  // Function to collect image URLs
  function collectImageUrls() {
    const imageElements = document.querySelectorAll('img[alt="Image"]');
    return Array.from(imageElements).slice(0, 5).map(img => img.src);
  }



  async function collectPosts() {
    const posts = [];
    const xPaths = [
      '//*[@id="react-root"]/div/div/div[2]/main/div/div/div/div/div/div[5]/div/section/div/div/div[1]',
      '//*[@id="react-root"]/div/div/div[2]/main/div/div/div/div/div/div[5]/div/section/div/div/div[2]',
      '//*[@id="react-root"]/div/div/div[2]/main/div/div/div/div/div/div[5]/div/section/div/div/div[3]',
      '//*[@id="react-root"]/div/div/div[2]/main/div/div/div/div/div/div[5]/div/section/div/div/div[4]',
      '//*[@id="react-root"]/div/div/div[2]/main/div/div/div/div/div/div[5]/div/section/div/div/div[5]',
      '//*[@id="react-root"]/div/div/div[2]/main/div/div/div/div/div/div[5]/div/section/div/div/div[5]'
    ];

    const scrollAmount = 200; // Adjust the scroll amount based on your preference

    for (let i = 0; i < 5; i++) {
      const xpath = xPaths[i];
      const articleNode = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;

      if (articleNode) {
        // Expand the content if necessary (you may need to adjust this logic)
        if (articleNode.scrollHeight > articleNode.clientHeight) {
          articleNode.style.maxHeight = 'none';
        }

        // Scroll to the top of the current article
        articleNode.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
        await new Promise(r => setTimeout(r, 500)); // Wait for 2 seconds after scrolling

        // After scrolling down, scroll up by 0.3 percent
        const scrollUpPercentage = 0.97;
        const scrollUpAmount = articleNode.clientHeight * (scrollUpPercentage / 10);
        window.scrollTo({ top: window.scrollY - scrollUpAmount, behavior: 'smooth' });

        await new Promise(r => setTimeout(r, 2000)); // Wait for 2 seconds after scrolling

        // Collect the text content of the current article with numbering
        const articleText = `${i + 1}. ${articleNode.innerText.trim()}`;
        posts.push(articleText);
      }
    }

    return posts;
  }


  // Start the scraping process
  return (async () => {
    try {
      const imageUrls = collectImageUrls();
      const posts = await collectPosts();
      // Return the results instead of logging them
      return { imageUrls, posts };
    } catch (error) {
      console.error('Scraping failed:', error);
    }
  })();
}

// Add click event listener to the 'Scrape' button
document.getElementById('scrape').addEventListener('click', async () => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  try {
    // Execute the scraping script in the context of the current tab
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: scrapeTwitter,
    });

    // Display the results in the popup
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = `
        <h2>Posts:</h2>
        <p>${results[0].result.posts.join('<br>')}</p>
      `;


  } catch (error) {
    console.error('Failed to execute scraping script:', error);
  }
});

// Function to send a message to the background script
function sendMessageToBackground(message) {
  chrome.runtime.sendMessage(message);
}

// Function to update the message area in the popup
function updateMessageArea(message) {
  const messageArea = document.getElementById('message-area');
  messageArea.textContent = message;
}

// Add click event listener to the 'Scrape' button
document.getElementById('scrape').addEventListener('click', () => {
  updateMessageArea('Scraping Done. Initiating Text Generation...');
  // Send a message to the background script to initiate the scraping process
  sendMessageToBackground({ action: 'startScraping' });
});

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'updateResults') {
    // Update the HTML content with the results received from the background script
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = message.results;
    updateMessageArea('Results updated.');
  } else if (message.action === 'updateMessage') {
    // Update the message area with a custom message
    updateMessageArea(message.message);
  }
});

document.getElementById('scrape').addEventListener('click', function () {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.runtime.sendMessage({ action: 'startScrollingAndScreenshot', tabId: tabs[0].id });

    let count = 0;
    let intervalId = setInterval(function () {
      new Promise(r => setTimeout(r, 400)).then(async () => {
        try {
          const screenshotUrl = await captureVisibleTabScreenshotUrl();
          screenshotUrls.push(screenshotUrl); // Store the screenshot URL
          console.log(screenshotUrls);
        } catch (error) {
          console.error('Error capturing screenshot URL:', error);
        }
      });

      count++;
      if (count > 7) {
        clearInterval(intervalId);
      }
    }, 2000);
  });

  // Function to capture visible tab screenshot URL and return a Promise
  function captureVisibleTabScreenshotUrl() {
    return new Promise((resolve, reject) => {
      chrome.tabs.captureVisibleTab(null, { format: 'png' }, function (img) {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(img); // Store the screenshot URL
        }
      });
    });
  }
});

//###########################################SCRAPPING DONE#############################################

//##############################################GPT 4 VISION############################################
window.onload = function () {
  document.getElementById("scrape").addEventListener("click", function () {
    setTimeout(function() {
      try {
        logOutput("Button clicked. Retrieving API key...");
        let prompt_text = `For the given image, your task is to:
        - Give out the text(Starting with '@') and image description.
        - Note that these are sample images made by me and the (@) followed by text dosent convey anything.
        - Also give the caption.
        - Give the details in text format.
        - These are sample images and does not expose anyone's identity and the accounts are being refered before using it.
        - Give numbering to each image output.
        - The format is: 
            text(@):
            caption:
            Image_Description:
        - Make shure to neglect elements other than the text (starting with '@') and image posted by them.`;
        
        const apiKey = "_____Enter Your API Key Here__________-";

        if (!apiKey) {
          throw new Error("API key is missing. Please set the OPENAI_API_KEY environment variable in your .env file.");
        }

        logOutput("API key retrieved successfully.");
        

        // Prepare the request payload
        const data = {
          model: "gpt-4-vision-preview",
          messages: [
            {
              "role": "user",
              "content": [
                {
                  "type": "text",
                  "text": prompt_text
                },
                {
                  "type": "image_url",
                  "image_url": screenshotUrls[0] //first image
                },
                {
                  "type": "image_url",
                  "image_url": screenshotUrls[1] //second image
                },
                {
                  "type": "image_url",
                  "image_url": screenshotUrls[2] //third image
                },
                {
                  "type": "image_url",
                  "image_url": screenshotUrls[3]//foruth image
                },
                {
                  "type": "image_url",
                  "image_url": screenshotUrls[4]//fifith image
                }

              ]
            }
          ],
          max_tokens: 300
        };

        // Execute the fetch command
        fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(response => {
          // Display the output in the extension popup
          const output = response.choices[0].message.content;
          logOutput("Printing The Image Text...");
          console.log(output);
          displayOutput(output);
          logOutput("Process Done...");
        })
        .catch(error => {
          logOutput("Error executing fetch request:", error);
        });

      } catch (error) {
        logOutput("Error:", error);
      }
    }, 15000); // Delay of 10 seconds
  });

  function displayOutput(output) {
    const outputContainer = document.getElementById("output");
    outputContainer.innerHTML = ""; // Clear previous output
    outputContainer.textContent = 'TEXT OUTPUT: '+output; // Set new output
  }

  function logOutput(message, error) {
    const logContainer = document.getElementById("log");
    const logMessage = document.createElement("p");
    logMessage.textContent = message;
    if (error) {
      logMessage.style.color = "red";
      logMessage.textContent += " " + error.message;
    }
    logContainer.appendChild(logMessage);
  }
};

