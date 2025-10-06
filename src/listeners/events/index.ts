import memberJoinedChannelHandler from './memberJoinedChannel.js';

export default function () {
	app.event('member_joined_channel', memberJoinedChannelHandler);
}
