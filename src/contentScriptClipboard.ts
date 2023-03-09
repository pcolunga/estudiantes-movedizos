(function () {
    document.addEventListener("copy", async () => {
        const text = await navigator.clipboard.readText()
        if (text) await chrome.runtime.sendMessage({"copy-event": text});
    })
})()
