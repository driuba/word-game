export default {
	db: {
		get database() {
			return process.env.DB_DATABASE;
		},
		get host() {
			return process.env.DB_HOST;
		},
		get password() {
			return process.env.DB_PASSWORD;
		},
		get schema() {
			return process.env.DB_SCHEMA;
		},
		get username() {
			return process.env.DB_USERNAME;
		}
	},
	get nodeEnv() {
		return process.env.NODE_ENV ?? 'development';
	},
	get port() {
		return parseInt(process.env.PORT ?? '3000');
	},
	slack: {
		get appToken() {
			return process.env.SLACK_APP_TOKEN;
		},
		get botToken() {
			return process.env.SLACK_BOT_TOKEN;
		},
		get clientId() {
			return process.env.SLACK_CLIENT_ID;
		},
		get clientSecret() {
			return process.env.SLACK_CLIENT_SECRET;
		},
		get signingSecret() {
			return process.env.SLACK_SIGNING_SECRET;
		}
	},
	get wgPrefixCommand() {
		return process.env.WG_PREFIX_COMMAND ?? 'wg';
	}
} as const;
