import { SlashCommand, CommandOptionType, ApplicationCommandPermissionType, CommandContext } from 'slash-create';
import setup from '../../service/poap/setup';
import { Message } from 'discord.js';

module.exports = class POAPEventSetup extends SlashCommand {
	constructor(creator) {
		super(creator, {
			name: 'poap',
			description: 'POAP Event Setup and Claim',
			guildIDs: process.env.DISCORD_SERVER_ID,
			options: [
				{
					name: 'setup',
					type: CommandOptionType.SUB_COMMAND,
					description: 'Setup Event for POAP Distribution',
					options: [
						{
							name: 'response',
							type: CommandOptionType.STRING,
							description: 'Response to send privately to members during the event?',
							required: true,
						},
						{
							name: 'password',
							type: CommandOptionType.STRING,
							description: 'Choose a password. This password is for your users to access their claim links.',
							required: true,
						},
						{
							name: 'start',
							type: CommandOptionType.STRING,
							description: 'Date and time to START 🛫 ? *Hint: Time in UTC this format 👉  yyyy-mm-dd hh:mm',
							required: true,
						},
						{
							name: 'end',
							type: CommandOptionType.STRING,
							description: 'Date and time to END 🛫 ? *Hint: Time in UTC this format 👉  yyyy-mm-dd hh:mm (${hintDate})',
							required: true,
						},
					],
				},
			],
			throttling: {
				usages: 2,
				duration: 1,
			},
			defaultPermission: false,
			permissions: {
				[process.env.DISCORD_SERVER_ID]: [
					{
						type: ApplicationCommandPermissionType.ROLE,
						id: process.env.DISCORD_ROLE_LEVEL_1,
						permission: true,
					},
					{
						type: ApplicationCommandPermissionType.ROLE,
						id: process.env.DISCORD_ROLE_LEVEL_2,
						permission: true,
					},
					{
						type: ApplicationCommandPermissionType.ROLE,
						id: process.env.DISCORD_ROLE_LEVEL_3,
						permission: true,
					},
					{
						type: ApplicationCommandPermissionType.ROLE,
						id: process.env.DISCORD_ROLE_GENESIS_SQUAD,
						permission: true,
					},
					{
						type: ApplicationCommandPermissionType.ROLE,
						id: process.env.DISCORD_ROLE_GUEST_PASS,
						permission: true,
					},
				],
			},
		});

		this.filePath = __filename;
	}

	async run(ctx: CommandContext) {
		if (ctx.user.bot) return;
		let command: Promise<any>;
		command = setup(ctx);

		this.handleCommandError(ctx, command);
	}

	handleCommandError(ctx: CommandContext, command: Promise<any>) {
		command.catch(e => {
			console.error('ERROR', e);
		});
	}
};