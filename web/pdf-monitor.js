let ENDPOINT = "http://localhost:5000/event"
	
function postToServer(obj) {
    const rawResponsePromise = fetch(ENDPOINT, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(obj)
    });
    rawResponsePromise.then(function(rawResponse) {
        const contentPromise = rawResponse.json();
        contentPromise.then(function(content) {
            console.log(content);
        })
    })
}

function monitorLog(data) {
    let logItem = {
        type: "pdf",
        href: window.location.href,
        time: new Date(),
        data
    };
    console.log(logItem);
    postToServer(logItem);
}

function onSelect() {
    // is this selection within the textLayer
    let sel = window.getSelection();
    if (sel.toString().length === 0) return;
    let el = sel.focusNode;
    let validSelection = false;
    while (el) {
        if (el.classList && el.classList.contains("textLayer")) {
            validSelection = true;
            break;
        }
        el = el.parentElement;
    }
    if (validSelection) {
        monitorLog({
            event: "selectionChange",
            selection: window.getSelection().toString()
        })
    }
}

function debounce(f){

    // --- debounce logic ---
    let count = 0;
    let args = [];
    let scheduledAt = 0;

    function debouncedHandler() {
        count++;
        args = new Array(...arguments);
        if (scheduledAt === 0) {
            scheduleRun();
        }
    }

    function scheduleRun() {
        scheduledAt = count;
        setTimeout(() => {
            if (scheduledAt === count) {
                f(...args);
                count = 0;
                args = [];
                scheduledAt = 0;
            }
            else {
                scheduleRun();
            }
        }, 300);
    }

    return debouncedHandler;

}

// debounced onSelectionChange
document.onselectionchange = debounce(onSelect);
console.log("Setup selection event listener on " + window.location.href);

export {
    monitorLog,
    debounce
}