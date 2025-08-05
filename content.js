const overlay = document.createElement('div');
overlay.id = 'icon-extension-container';
overlay.style.position = 'fixed';
overlay.style.bottom = '10px';
overlay.style.left = '10px';
overlay.style.zIndex = '9999';
overlay.style.opacity = '0.7';
overlay.style.display = 'flex';

document.body.appendChild(overlay);
updateOverlay();

setInterval(() => {
    chrome.runtime.sendMessage({ action: 'refreshOverlay' });
}, 60000);

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'refreshOverlay') {
        updateOverlay(request.data);
        sendResponse({ status: 'Overlay refreshed' });
    }
});

function updateOverlay(warnings) {
    overlay.innerHTML = '';

    if (!warnings) {
        chrome.runtime.sendMessage({ action: 'fetchData' }, (response) => {
            if (response.error) {
                console.error('Error fetching data:', response.error);
                overlay.innerHTML = '<span style="color: red;">Failed to load warnings</span>';
                return;
            }
            renderWarnings(response.data);
        });
    } else {
        renderWarnings(warnings);
    }
}

function renderWarnings(warnings) {
    warnings.forEach((warning) => {
        const img = document.createElement('img');
        img.src = warning.Icon;
        img.classList.add('weather-warning');
        img.style.cursor = 'pointer';
        img.title = warning.WarningName;
        overlay.appendChild(img);
    });
}