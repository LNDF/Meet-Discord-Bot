(function(){
    setInterval(() => {
        let btns = document.querySelectorAll('div[role="button"][data-is-muted="false"]');
        for (const btn of btns) {
            btn.click();
        }
    });
    console.log("MiCCamHelper injected");
})();