import { CommandContext } from 'slash-create';
import db from '../../utils/db';
import constants from '../../constants';
import { MongoError } from 'mongodb';
import ServiceUtils from '../../utils/ServiceUtils';

export default async (ctx: CommandContext): Promise<any> => {
	if (ctx.user.bot) return;

	const { guildMember } = await ServiceUtils.getGuildAndMember(ctx);
	const params = ctx.options.setup;


	return db.connect(constants.DB_NAME_DEGEN, async (error: MongoError): Promise<any> => {
		if (error) {
			console.log('ERROR', error);
			return ctx.send('Sorry something is not working, our devs are looking into it.');
		}

		const dbPOAP = db.get().collection(constants.DB_COLLECTION_POAPS);
		const newPOAPEvent = module.exports.generatePOAPEventRecord(response, password, start, end, ctx.user.username, ctx.user.id);

		const dbInsertResult = await dbPOAP.insertOne(newPOAPEvent);
		if (dbInsertResult == null) {
			console.error('failed to insert POAP Event into DB', error);
			return ctx.send('Sorry something is not working, our devs are looking into it.');
		}
		await db.close();
		console.log(`user ${ctx.user.username} inserted into db`);
		return ctx.send(`Event is setup, <@${ctx.user.id}>! Distribution will begin at ${start}`);
	});
};

module.exports.generatePOAPEventRecord = (response: string, password: string, start: string, end: string, discordHandle: string,
	discordId: string) => {
	const currentDate = (new Date()).toISOString();
	return {
		season: process.env.DAO_CURRENT_SEASON,
		response: response,
		password: password,
		start: start,
		end: end,
		createdBy: {
			discordHandle: discordHandle,
			discordId: discordId,
		},
		createdAt: currentDate,
		isDiscordBotGenerated: true,
	};
};