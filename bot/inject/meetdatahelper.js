(function(){
	let meetDataFinals = null;
	function getMeetData() {
		let finals = {};
		let elms = document.querySelector(".GvcuGe").children;
		for (const el of elms) {
			if (el.children[0].children[1].children[0].children.length > 1) continue;
			let name = el.children[0].children[1].children[0].children[0].innerHTML;
			let nepue = el.children[1].children[0].children[0].children[1].children[0].children[0];
			let hasMic = !nepue.classList.contains("FTMc0c");
			if (finals[name] == undefined || finals[name] == false) finals[name] = hasMic;
		}
		if (deepEqual(finals, meetDataFinals)) return;
		meetDataFinals = finals;
        meetBotParticipantsUpdate(finals);
	}
	
	function moSetup() {
		let mo = new MutationObserver(getMeetData);
		let config = {
			attributes: true,
			subtree: true,
			attributeFilter: ["class"]
		}
		mo.observe(document.querySelector(".GvcuGe"), config);
	}
	
	function deepEqual(x, y) {
		const ok = Object.keys, tx = typeof x, ty = typeof y;
		return x && y && tx === 'object' && tx === ty ? (
			ok(x).length === ok(y).length &&
			ok(x).every(key => deepEqual(x[key], y[key]))
		) : (x === y);
	}

	function init() {
		if (document.querySelector("h4.XIsaqe.isOLae") == null) {
			document.querySelector("div.uArJ5e.UQuaGc.kCyAyd.QU4Gid.foXzLb.IeuGXd .NPEfkd.RveJvd.snByac").click();
			setTimeout(init, 500);
		} else {
			getMeetData();
			moSetup();
		}
	}
	init();
	console.log("MeetDataHelper injected");
})();