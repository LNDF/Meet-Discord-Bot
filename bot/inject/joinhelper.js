(function(){
    setInterval(() => {
        let btns = document.querySelectorAll('div[role="button"][data-is-muted="false"]');
        for (const btn of btns) {
            btn.click();
        }
    });
    document.querySelector("div.uArJ5e.UQuaGc.Y5sE8d.uyXBBb.xKiqt .NPEfkd.RveJvd.snByac").click();
    console.log("JoinHelper injected");
})();