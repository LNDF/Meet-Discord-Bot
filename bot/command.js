const Discord = require("discord.js");

const registeredCommands = new Array();

exports.Command = class Command {
	name;
	usage;
	parameters;
	callback;
	constructor(name, usage, parameters, callback) {
		this.name = name;
		this.usage = usage;
		this.parameters = parameters;
		this.callback = callback;
	}

	isThisCommand(message, prefix) {
		return message.content.split(" ")[0].substr(prefix.length) == this.name && message.content.indexOf(prefix) == 0;
	}

	isValidUsage(message) {
		return message.content.split(" ").length >= this.parameters + 1;
	}

	printUsage(msg, prefix) {
		let s = "Usage: " + prefix + this.name;
		for (const p of this.usage) {
			s += " <" + p + ">"
		}
		msg.channel.send(s);
	}

	parseAndRun(message, prefix) {
		if (this.isThisCommand(message, prefix)) {
			if (!this.isValidUsage(message)) {
				this.printUsage(message, prefix);
				return true;
			}
			let pars = message.content.split(" ").slice(1);
			this.run(pars, message);
			return true;
		}
		return false;
	}

	run(params, message) {
		this.callback(params, message);
	}
}

exports.processCommand = function processCommand(msg, prefix, client) {
	if (client.user != msg.author) {
		for (const obj of registeredCommands) {
			if (obj.parseAndRun(msg, prefix)) return;
		}
	}
}

exports.registerCommand = function registerCommand(cmd) {
	for (const obj of registeredCommands) {
		if (obj.name == cmd.name) return false;
	}
	registeredCommands.push(cmd);
	return true;
}