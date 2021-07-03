/**
 * Handler for Discord event `guildMemberUpdate`.
 */

const GuestPassService = require('../service/GuestPassService.js');
const constants = require('../constants');
const { MessageEmbed, GuildMember, Role } = require('discord.js');
const { Client } = require('@notionhq/client');
const notion = new Client({ auth: process.env.NOTION_TOKEN });

module.exports = async(oldMember, newMember) => {
	module.exports.handleRoleUpdate(oldMember, newMember)
}

/**
 * Checks if roles were updated and calls approriate handler.
 * 
 * @param {GuildMember} oldMember 
 * @param {GuildMember} newMember 
 */
module.exports.handleRoleUpdate = (oldMember, newMember) => {
	const oldRoles = oldMember.roles.cache
	const newRoles = newMember.roles.cache
	const updatedRoles = oldRoles.difference(newRoles)

	if (updatedRoles.size === 0) {
		// No roles were added or removed
		return
	}

	if (oldRoles.size < newRoles.size) {
		// Role was added
		updatedRoles.each(role => module.exports.handleRoleAdded(newMember, role))
	} else if (oldRoles.size > newRoles.size) {
		// Role was removed
		updatedRoles.each(role => module.exports.handleRoleRemoved(newMember, role))
	}
}

/**
 * Handles event when role is added to member.
 * 
 * @param {GuildMember} member The newMember object emitted by `guildMemberUpdate`
 * @param {Role} role Role that has been added
 */
module.exports.handleRoleAdded = (member, role) => {
	switch(role.name) {
		case (constants.DISCORD_ROLE_GUEST_PASS):
			GuestPassService.updateNotionGuestPassDatabase(member.user.tag, true);
			break;
		case (constants.DISCORD_ROLE_DEVELOPERS_GUILD):
			module.exports.handleDeveloperGuildRoleAdded(member)
			break;
	}
}

/**
 * Handles event when role is removed from member.
 * 
 * @param {GuildMember} member The newMember object emitted by `guildMemberUpdate`
 * @param {Role} role Role that has been removed
 */
module.exports.handleRoleRemoved = (member, role) => {
	switch(role.name) {
		case (constants.DISCORD_ROLE_GUEST_PASS):
			GuestPassService.updateNotionGuestPassDatabase(member.user.tag, false);
			break;
	}
}

/**
 * Handles event when Developer's Guild role is assigned.
 * 
 * Sends a direct message to member when they are assigned the Developer's Guild role.
 * 
 * @param {GuildMember} member The newMember object emitted by `guildMemberUpdate`
 */
module.exports.handleDeveloperGuildRoleAdded = async(member) => {
	if (!member.roles.cache.some(role => role.name === constants.DISCORD_ROLE_DEVELOPERS_GUILD)) {
		return;
	}

	// Get active projects
	const response = await notion.databases.query({
		database_id: process.env.DEV_GUILD_PROJECTS_DATABASE_ID,
		filter: {
			property: 'Status',
			select: {
				equals: "Active"
			}
		}
	})

	// Begin building the message
	let message = "";

	// Print resources for getting started
	message += "Here are some resources to help you get started:\n"
	message += "[Developer's Guild Notion](https://www.notion.so/bankless/Developers-Guild-7dbde19a264d43debf75ecb27a9d406c)\n"
	message += "[Bankless DAO Github](https://github.com/BanklessDAO)\n"

	// Print information for each project
	message += "\nHere are the projects we are working on:\n"
	response.results.forEach(page => {
		message += `**[${page.properties["Project"].title[0].text.content}](${page.url})**\n`

		let description = page.properties["Description"].rich_text[0]
		if (description) {
			message += `${description.text.content}\n`
		}
		
		let techStack = page.properties["Tech Stack"].multi_select
		if (techStack.length > 0) {
			message += `Tech Stack: `
			techStack.forEach((field, index) => {
				message += `${field.name}`
				if (index < techStack.length - 1) {
					message += `, `
				} else {
					message += '\n'
				}
			})
		}

		let github = page.properties["Github"].rich_text[0]
		if (github) {
			message += `Github: ${github.text.link.url}\n`
		}

		let discordChannel = page.properties["Discord Channel"].rich_text[0]
		if (github) {
			message += `Discord Channel: [${discordChannel.text.content}](${discordChannel.text.link.url})\n`
		}

		message += '\n'
	})

	const embed = new MessageEmbed()
		.setTitle("Welcome to the Developer's Guild!")
		.setColor(0xf1c40f)
		.setDescription(message)

	member.send(embed).catch(console.error)
}