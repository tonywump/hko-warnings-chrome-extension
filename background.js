const warningSignal = {
    "TC1":{"WarningName":"一號戒備信號","Icon":'https://www.hko.gov.hk/en/textonly/img/warn/images/tc1.gif'},
    "TC3":{"WarningName":"三號強風信號","Icon":'https://www.hko.gov.hk/en/textonly/img/warn/images/tc3.gif'},
    "TC8NE":{"WarningName":"八號東南烈風或暴風信號","Icon":'https://www.hko.gov.hk/en/textonly/img/warn/images/tc8ne.gif'},
    "TC8NW":{"WarningName":"八號西北烈風或暴風信號","Icon":'https://www.hko.gov.hk/en/textonly/img/warn/images/tc8nw.gif'},
    "TC8SE":{"WarningName":"八號東南烈風或暴風信號","Icon":'https://www.hko.gov.hk/en/textonly/img/warn/images/tc8se.gif'},
    "TC8SW":{"WarningName":"八號西南烈風或暴風信號","Icon":'https://www.hko.gov.hk/en/textonly/img/warn/images/tc8sw.gif'},
    "TC9":{"WarningName":"九號烈風或暴風風力增強信號","Icon":'https://www.hko.gov.hk/en/textonly/img/warn/images/tc9.gif'},
    "TC10":{"WarningName":"十號颶風信號","Icon":'https://www.hko.gov.hk/en/textonly/img/warn/images/tc10.gif'},
    "WRAINA":{"WarningName":"黃色暴雨警告信號","Icon":'https://www.hko.gov.hk/en/textonly/img/warn/images/raina.gif'},
    "WRAINR":{"WarningName":"紅色暴雨警告信號","Icon":'https://www.hko.gov.hk/en/textonly/img/warn/images/rainr.gif'},
    "WRAINB":{"WarningName":"黑色暴雨警告信號","Icon":'https://www.hko.gov.hk/en/textonly/img/warn/images/rainb.gif'},
    "WTS":{"WarningName":"雷暴警告","Icon":'https://www.hko.gov.hk/en/textonly/img/warn/images/ts.gif'},
    "WL":{"WarningName":"山泥傾瀉警告","Icon":'https://www.hko.gov.hk/en/textonly/img/warn/images/landslip.gif'},
    "WFROST":{"WarningName":"霜凍警告","Icon":'hhttps://www.hko.gov.hk/en/textonly/img/warn/images/frost.gif'},
    "WFIREY":{"WarningName":"黃色火災危險警告","Icon":'https://www.hko.gov.hk/en/textonly/img/warn/images/firey.gif'},
    "WFIRER":{"WarningName":"紅色火災危險警告","Icon":'https://www.hko.gov.hk/en/textonly/img/warn/images/firer.gif'},
    "WCOLD":{"WarningName":"寒冷天氣警告","Icon":'https://www.hko.gov.hk/en/wservice/warning/images/warncold.gif'},
    "WHOT":{"WarningName":"酷熱天氣警告","Icon":'https://www.hko.gov.hk/en/wservice/warning/images/warnhot.gif'},
    "WTMW":{"WarningName":"海嘯警告","Icon":'https://www.hko.gov.hk/en/textonly/img/warn/images/tsunami-warn.gif'},
    "WMSGNL":{"WarningName":"強烈季候風信號","Icon":'https://www.hko.gov.hk/en/wxinfo/dailywx/images/msn.gif'},
}


chrome.runtime.onInstalled.addListener(() => {
    console.log("Extension installed");
});

function updateOverlay() {
    return fetch('https://data.weather.gov.hk/weatherAPI/opendata/weather.php?dataType=warningInfo&lang=en')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok: ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            const warnings = [];
            const seenNames = new Set();
            
            if(!data || !'details' in data) return [];

            data['details'].forEach(item => {
                const warningCode = item.subtype??item.warningStatementCode;
                if (!seenNames.has(warningCode)) {
                    seenNames.add(warningCode);
                    warnings.push(warningSignal[warningCode]);
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