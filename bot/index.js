const Discord = require("discord.js");
const Command = require("./command");
const Meet = require("./meet");
require("dotenv").config()

let currentMeet = null;

const client = new Discord.Client();

async function joinMeet(params, message) {
	if (currentMeet != null) {
		message.channel.send("Error. Already in a Meet call.");
		return;
	}
	joining = true;
	const meet = new Meet.MeetCall(params[0]);
	currentMeet = meet;
	await meet.join(message.channel);
	if (!meet.joined) currentMeet = null;
	joining = false;
}

async function leaveMeet(params, message) {
	if (currentMeet == null) {
		message.channel.send("Error. Not in a Meet call.");
		return;
	}
	currentMeet.leave(message.channel);
	currentMeet = null;
	joining = false;
}

async function meetData(params, message) {
	if (currentMeet == null) {
		message.channel.send("Error. Not in a Meet call.");
		return;
	}
	message.channel.send("Currently in " + currentMeet.url);
	if (currentMeet.participants != null) {
		let len = 0;
		let msg = "\n\nParticipants:\n";
		let pStrs = [];
		len += msg.length;
		pStrs.push(msg);
		const part = Object.entries(currentMeet.participants);
		for (const p of part) {
			msg = " - " + p[0] + " - microphone " + (p[1] ? "on" : "off") + "\n";
			len += msg.length;
			if (len >= 2000) {
				message.channel.send(pStrs.join(""));
				pStrs = [];
				len = msg.length;
			}
			pStrs.push(msg);
		}
		if (pStrs.length != 0) message.channel.send(pStrs.join(""));
	}
}

async function firstLoginSetup(params, message) {
	if (process.env.FIRSTLOGINALLOWED != "yes") {
		message.channel.send("First login setup is not allowed.");
		return;
	}
	message.channel.send("Trying to log in for the first time...");
	try {
		const page = Meet.makePage();
		const saveDir = await Meet.login(true, page);
		message.channel.send("Logged in");
	} catch {
		message.channel.send("Couldn't log in for the first time.");
	}
	
}

client.on('ready', () => {
	console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', (msg) => {
	Command.processCommand(msg, "!meet", client);
});

Command.registerCommand(new Command.Command("join", ["code"], 1, joinMeet));
Command.registerCommand(new Command.Command("leave", [], 0, leaveMeet));
Command.registerCommand(new Command.Command("getdata", [], 0, meetData));
Command.registerCommand(new Command.Command("firstloginsetup", [], 0, firstLoginSetup));

client.login(process.env.TOKEN);