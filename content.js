function getPaperMetadata() {
    const title =
      document.querySelector("meta[name='citation_title']")?.content ||
      document.querySelector("meta[property='og:title']")?.content ||
      document.title;
  
    const abstract =
      document.querySelector("meta[name='citation_abstract']")?.content ||
      document.querySelector("meta[name='description']")?.content ||
      "";
  
    return { title, abstract };
  }
  
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "GET_PAPER_METADATA") {
      sendResponse(getPaperMetadata());
    }
  });
  