const pkgDir = require("pkg-dir");
const puppeteer = require("puppeteer-extra");
const stelth = require("puppeteer-extra-plugin-stealth")();
const fs = require("fs");
const { resolve } = require("path");

puppeteer.use(stelth);

function pageHasUrl(page, url) {
	return page.url().indexOf(url) == 0;
}

async function savePageState(page, error = null) {
	const savepath = (await pkgDir()) + "/errors/error_" + Date.now() + "/";
	await fs.promises.mkdir(savepath, {recursive: true});
	if (page != null) {
		await page.screenshot({path: savepath + "screen.png"});
		const htmlContent = await page.evaluate(() => document.documentElement.outerHTML);
		await fs.promises.writeFile(savepath + "document.html", htmlContent);
	}
	if (error != null) {
		await fs.promises.writeFile(savepath + "error.txt", error.stack);
	}
}

async function makePage() {
	const cwd = await pkgDir() + "/browserData";
	const puppeteerSettings = {headless: true,
							   userDataDir: cwd};
	if (process.env.CHROMIUM_EXECUTABLE != undefined) {
		puppeteerSettings.executablePath = process.env.CHROMIUM_EXECUTABLE;
	}
	const browser = await puppeteer.launch(puppeteerSettings);
	const userAgent = await browser.userAgent();
	
	const context = browser.defaultBrowserContext();
	context.overridePermissions("https://meet.google.com", ['microphone', "camera"]);
	const [page] = await browser.pages();
	await page.setUserAgent(userAgent.replace("Headless", ""));
	await page.setDefaultNavigationTimeout(0);
	return page;
}
exports.makePage = makePage;

async function login(first, page) {
	await page.goto("https://accounts.google.com/ServiceLogin?passive=true&continue=https://www.google.com/",
				{waitUntil: "load"});
	if (pageHasUrl(page, "https://www.google.com/")) {
		if (first) {
			await browser.close();
		}
		return;
	}
	await page.waitForSelector('input[type="email"]');
	await page.type('input[type="email"]', process.env.DEFAULT_USER);
	await page.keyboard.press("Enter");
	//await page.click("#identifierNext");
	await page.waitForSelector('input[type="password"]', {visible: true});
	await page.type('input[type="password"]', process.env.DEFAULT_PASSWORD);
	//await page.waitForSelector("#passwordNext", {visible: true});
	//await page.click("#passwordNext");
	await page.keyboard.press("Enter");
	while (true) {
		await page.waitForNavigation({waitUntil: "networkidle0"})
		if (pageHasUrl(page, "https://www.google.com/")) break;
	}
	if (first) {
		await browser.close();
	}
}
exports.login = login;

function injectJS(path, page) {
	return new Promise((resolve, reject) => {
		fs.readFile(path, null, (err, data) => {
			if (err) {
				reject(err);
			} else {
				page.evaluate(data.toString()).then(data => {
					resolve(data);
				});
			}
		});
	});
}

exports.MeetCall = class MeetCall {
	url;
	page;
	browser;
	participants;
	joined;
	closed;
	constructor(url) {
		this.browser = null;
		this.page = null;
		this.joined = false;
		this.failed = false;
		this.closed = false;
		this.participants = null;
		this.url = "https://meet.google.com/" + url;
	}

	async join(channel) {
		try {
			channel.send("Joining " + this.url);
			const page = await makePage();
			this.page = page;
			this.browser = page.browser();
			await login(false, page);
			await page.goto(this.url, {waitUntil: "load"});
			await page.waitForSelector("div.uArJ5e.UQuaGc.Y5sE8d.uyXBBb.xKiqt .NPEfkd.RveJvd.snByac", {visible: true});
			await injectJS((await pkgDir()) + "/bot/inject/miccamhelper.js", page);
			await page.click("div.uArJ5e.UQuaGc.Y5sE8d.uyXBBb.xKiqt .NPEfkd.RveJvd.snByac");
			await page.waitForSelector(".U26fgb.JRY2Pb.mUbCce.kpROve.GaONte.Qwoy0d.ZPasfd.vzpHY", {visible: true});
			await page.waitForSelector("div.uArJ5e.UQuaGc.kCyAyd.QU4Gid.foXzLb.IeuGXd .NPEfkd.RveJvd.snByac", {visible: true});
			await page.click("div.uArJ5e.UQuaGc.kCyAyd.QU4Gid.foXzLb.IeuGXd .NPEfkd.RveJvd.snByac");
			await page.waitForSelector("h4.XIsaqe.isOLae", {visible: true});
			await page.exposeFunction("meetBotParticipantsUpdate", p => {this.participants = p});
			await injectJS((await pkgDir()) + "/bot/inject/meetdatahelper.js", page);
			this.joined = true;
			channel.send("Joined the meet call with no errors.");
		} catch (e) {
			await savePageState(this.page, e);
			this.leave(channel, true);
			console.error("Error joining meet call", e.message);
		}
	}

	async leave(channel, failed = false) {
		if (this.closed) return;
		this.closed = true;
		if (failed) {
			channel.send("Error joining the meet call.");
		} else {
			await channel.send("Leaving " + this.url);
		}
		if (this.browser != null) await this.browser.close();
	}
}