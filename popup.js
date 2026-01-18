let currentPaper = null;

document.addEventListener("DOMContentLoaded", async () => {
  const [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true
  });

  if (!tab.url || tab.url.startsWith("chrome://") || tab.url.startsWith("https://chrome.google.com")) {
    document.getElementById("title").textContent = "No paper detected";
    renderSavedPapers();
    return;
  }
  
  chrome.tabs.sendMessage(
    tab.id,
    { type: "GET_PAPER_METADATA" },
    (response) => {
      if (chrome.runtime.lastError || !response) {
        document.getElementById("title").textContent = "No paper detected";
        return;
      }
  
      currentPaper = {
        id: tab.url,
        title: response.title,
        abstract: response.abstract,
        url: tab.url
      };
  
      document.getElementById("title").textContent =
        response.title || "No paper detected";
  
      loadExistingRating();
    }
  );
  

  renderSavedPapers();
});

function loadExistingRating() {
  chrome.storage.local.get(["papers"], (result) => {
    const papers = result.papers || [];
    const existing = papers.find(p => p.id === currentPaper.id);

    if (existing) {
      document.getElementById("rating").value = existing.rating || "";
      document.getElementById("notes").value = existing.notes || "";
    }
  });
}


document.getElementById("save").addEventListener("click", () => {
  if (!currentPaper) return;

  const rating = document.getElementById("rating").value;
  const notes = document.getElementById("notes").value;

  chrome.storage.local.get(["papers"], (result) => {
    let papers = result.papers || [];

    const index = papers.findIndex(p => p.id === currentPaper.id);

    const paperData = {
        ...currentPaper,
        title: currentPaper.title || "Untitled paper",
        rating: rating ? Number(rating) : null,
        notes,
        savedAt: new Date().toISOString()
      };

    if (index >= 0) {
      // Update existing paper
      papers[index] = paperData;
    } else {
      // Save new paper
      papers.push(paperData);
    }

    chrome.storage.local.set({ papers }, () => {
      alert("Paper saved ✅");
    });
  });
});

function renderSavedPapers() {
    const list = document.getElementById("papersList");
    if (!list) return;
  
    list.innerHTML = "";
  
    chrome.storage.local.get(["papers"], (result) => {
      const papers = result.papers || [];
  
      if (papers.length === 0) {
        list.innerHTML = "<li>No saved papers yet</li>";
        return;
      }
  
      papers
        .sort((a, b) => (b.rating || 0) - (a.rating || 0))
        .forEach((paper) => {
          const li = document.createElement("li");
          li.style.cursor = "pointer";
  
          const rating = Number.isFinite(Number(paper.rating))
            ? `${paper.rating}/5`
            : "No rating";
  
          li.innerHTML = `
            <div class="paper-item">
              <div class="paper-title">${paper.title || "Untitled paper"}</div>
              <div class="paper-rating">${rating}</div>
            </div>
          `;
  
          li.addEventListener("click", () => {
            chrome.tabs.create({ url: paper.url });
          });
  
          list.appendChild(li);
        });
    });
  }
  
  
