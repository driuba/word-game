import type { AllMiddlewareArgs, SlackCommandMiddlewareArgs } from '@slack/bolt';
import { DateTime } from 'luxon';
import { getWordExpiration, getWordRights, getWordsActive } from '~/core/index.js';
import { messages } from '~/resources/index.js';

export default async function (
	{
		ack,
		payload: {
			channel_id: channelId,
			user_id: userId
		},
		respond
	}: AllMiddlewareArgs & SlackCommandMiddlewareArgs
) {
	await ack();

	// TODO: all words are active, need to handle private vs not
	// if (isWordActive(word)) {
	// 	if (word.userIdCreator === userId) {
	// 		await respond({
	// 			response_type: 'ephemeral',
	// 			text: messages.currentWordStatusPrivate({
	// 				expiration: getWordExpiration(word)?.toLocaleString(DateTime.DATETIME_SHORT),
	// 				score: word.score.toFixed(),
	// 				word: word.word
	// 			})
	// 		});
	//
	// 		return;
	// 	}
	//
	// 	await respond({
	// 		response_type: 'ephemeral',
	// 		text: messages.currentWordHolder({
	// 			userId: word.userIdCreator
	// 		})
	// 	});
	//
	// 	return;
	// }

	// TODO: add messages
	const words = await getWordsActive(channelId).then(
		ws => ws.reduce<{
			other: {
				word: string
			}[],
			personal: {
				expiration: string,
				score: string,
				word: string
			}[]
		}>(
			(a, w) => {
				if (w.userIdCreator === userId) {
					a.personal.push({
						expiration: getWordExpiration(w)?.toLocaleString(DateTime.DATETIME_SHORT) ?? '',
						score: w.score.toFixed(),
						word: w.word
					});
				} else {
					a.other.push({
						word: w.word
					});
				}

				return a;
			},
			{
				other: [],
				personal: []
			}
		)
	);


	const rights = await getWordRights(channelId).then(wrs => wrs.reduce(
		(a, wr) => {
			if (wr.users.length === 1) {
				if (wr.users[0].userId === userId) {
					a.personal++;
				}
			} else {
				a.shared++;
			}

			return a;
		},
		{
			personal: 0,
			shared: 0
		}
	));

	// TODO: pull all information about rights in one message
	if (rights.personal) {
		await respond({
			response_type: 'ephemeral',
			text: messages.hasWordRightsPersonal({ count: rights.personal.toFixed() })
		});
	} else if (rights.shared) {
		await respond({
			response_type: 'ephemeral',
			text: messages.hasWordRightsShared({ count: rights.shared.toFixed() })
		});
	} else {
		await respond({
			response_type: 'ephemeral',
			text: messages.hasWordRightsNone
		});
	}
}
