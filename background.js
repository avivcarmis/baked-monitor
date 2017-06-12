chrome.app.runtime.onLaunched.addListener(function() {
    chrome.system.display.getInfo(function (displays) {
        var display = displays[0];
        chrome.app.window.create('index.html', {
            id: 'GoToGuyWindow',
            outerBounds: {
                width: display.bounds.width,
                height: display.bounds.height
            }
        });
    })
});