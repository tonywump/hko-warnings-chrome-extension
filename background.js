chrome.runtime.onInstalled.addListener(() => {
    console.log("Extension installed");
});

function updateOverlay() {
    return fetch('https://www.hko.gov.hk/wxinfo/dailywx/wxwarntoday_uc.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok: ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            const warnings = [];
            const seenNames = new Set();
            data['WARNING_DATABASE'].forEach(item => {
                if (!seenNames.has(item.WarningName)) {
                    seenNames.add(item.WarningName);
                    warnings.push({
                        WarningName: item.WarningName,
                        Icon: 'https://www.hko.gov.hk' + item.Icon
                    });
                }
            });
            return warnings;
        });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'fetchData') {
        updateOverlay()
            .then(warnings => sendResponse({ data: warnings }))
            .catch(error => sendResponse({ error: error.message }));
        return true;
    }
    if (request.action === 'refreshOverlay') {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            updateOverlay()
                .then(warnings => {
                    chrome.tabs.sendMessage(tabs[0].id, { action: 'refreshOverlay', data: warnings });
                    sendResponse({ status: 'Overlay refresh requested' });
                })
                .catch(error => sendResponse({ error: error.message }));
        });
        return true;
    }
});