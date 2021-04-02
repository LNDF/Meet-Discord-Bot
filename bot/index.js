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
	let msg = "Currently in " + currentMeet.url
	if (currentMeet.participants != null) {
		const part = Object.entries(currentMeet.participants);
		const pStrs = [];
		for (const p of part) {
			pStrs.push(" - " + p[0] + " - microphone " + (p[1] ? "on" : "off"));
		}
		msg += "\n\nParticipants:\n" + pStrs.join("\n");
	}
	message.channel.send(msg);
}

async function firstLoginSetup(params, message) {
	if (process.env.FIRSTLOGINALLOWED != "yes") {
		message.channel.send("First login setup is not allowed.");
		return;
	}
	message.channel.send("Trying to log in for the first time...");
	try {
		const saveDir = await Meet.login(true);
		message.channel.send("Logged in and saved to " + saveDir);
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