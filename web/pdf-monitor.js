let ENDPOINT = "http://localhost:5000/event"
	
function postToServer(obj) {
    fetch(ENDPOINT, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(obj)
    });
}

function monitorLog(data) {
    let logItem = {
        type: "pdf",
        href: window.location.href,
        time: new Date(),
        data
    };
    postToServer(logItem);
}

/**
 * This logic is used for search query debounce
 */
function debounce(f, t){

    t = t || 1500;

    // --- debounce logic ---
    let count = 0;
    let args = [];
    let scheduledAt = 0;

    function debouncedHandler() {
        count++;
        args = [...arguments];
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
        }, t);
    }

    return debouncedHandler;

}

export {
    monitorLog,
    debounce
}


(function(){

	/**
	 * Listen on selections on the page debounced and send selection to background script
	 * 
	 * Debounce logic:
	 * every new event is allowed to update 'selection' if it's non-empty
	 * logic guarantees that onSelect will be run latest within ~750ms if no new event comes
	 * if a new event indeed comes, the firing of onSelect is deferred untils events settle 
	 * 
	 * This means that the selection is committed after it is held steady. An edge case is when
	 * the selection is immediately cleared; in this scenario nothing get's posted to the server. 
	 */
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
        selection = '';
    }
    
	let count = 0;
	let scheduledAt = 0;
	let selection = '';

	function debouncedHandler() {
		let newSelection = window.getSelection().toString();

		count++;
		selection = newSelection;
		if (scheduledAt === 0) {
			scheduleRun();
		}
	}

	function scheduleRun() {
		scheduledAt = count;
		setTimeout(() => {
			if (scheduledAt === count) {
				onSelect();
				count = 0;
				scheduledAt = 0;
			}
			else {
				scheduleRun();
			}
		}, 1500);
	}

	// debounced onSelectionChange
	document.onselectionchange = debouncedHandler;
})();

var commandListener = function(command) {
	if (command === 'note-prompt') {
        var text = window.prompt("Note ?");
        if (text) {
            monitorLog({
                event: "note",
                text
            })
        }
	}
};
chrome.commands.onCommand.addListener(commandListener);
