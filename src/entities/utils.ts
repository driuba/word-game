import { DateTime } from 'luxon';
import type { BaseEntity, EntityMetadata, EntityTarget, ValueTransformer } from 'typeorm';
import dataSource from './index.js';

export class DateTimeValueTransformer implements ValueTransformer {
	from(value?: Date) {
		return value ? DateTime.fromJSDate(value) : null;
	}

	to(value?: DateTime) {
		return value?.toJSDate() ?? null;
	}
}

export class FloatValueTransformer implements ValueTransformer {
	from(value: string) {
		return parseFloat(value);
	}

	to() {
		throw new Error('Not implemented.');
	}
}

export class IntValueTransformer implements ValueTransformer {
	from(value: string) {
		return parseInt(value);
	}

	to() {
		throw new Error('Not implemented.');
	}
}

/**
 * `insert` and `update` functions are inspired by *typeorm-deserializer* and a couple of *typeorm* GitHub issues
 * https://github.com/mdevecka/typeorm-deserializer/blob/master/src/typeorm-deserializer.ts
 * https://github.com/typeorm/typeorm/issues/6803#issuecomment-864681382
 * https://github.com/typeorm/typeorm/issues/9870#issuecomment-1594665438
 */
export async function insert<T extends BaseEntity>(entity: T, target: EntityTarget<T>) {
	const metadata = dataSource.getMetadata(target);

	const { raw: [raw] } = (await dataSource
		.getRepository(target)
		.createQueryBuilder()
		.insert()
		.values(metadata.columns
			.filter(c =>
				c.isInsert &&
				!(
					c.isGenerated ||
					c.isVirtual
				)
			)
			.reduce((a, c) => ({
				...a,
				[c.propertyName]: c.getEntityValue(entity) as unknown
			}), {})
		)
		.returning('*')
		.execute()) as { raw: [Record<string, unknown>] };

	return getResult(metadata, raw, target);
}

export async function update<T extends BaseEntity>(entity: T, target: EntityTarget<T>) {
	const metadata = dataSource.getMetadata(target);

	const { raw: [raw] } = (await dataSource
		.getRepository(target)
		.createQueryBuilder()
		.update()
		.set(metadata.columns
			.filter(c =>
				c.isUpdate &&
				!(
					c.isGenerated ||
					c.isVirtual
				)
			)
			.reduce((a, c) => ({
				...a,
				[c.propertyName]: c.getEntityValue(entity) as unknown
			}), {})
		)
		.where(metadata.columns
			.filter(c => c.isPrimary)
			.reduce((a, c) => ({
				...a,
				[c.propertyName]: c.getEntityValue(entity) as unknown
			}), {})
		)
		.returning('*')
		.execute()) as { raw: [Record<string, unknown>] };

	return getResult(metadata, raw, target);
}

function getResult<T extends BaseEntity>(
	metadata: EntityMetadata,
	raw: Record<string, unknown>,
	target: EntityTarget<T>
) {
	const result = dataSource
		.getRepository(target)
		.create();

	for (const column of metadata.columns) {
		if (column.isVirtual) {
			continue;
		}

		const value = raw[column.databaseName];

		if (typeof value === 'undefined') {
			continue;
		}

		column.setEntityValue(result, dataSource.driver.prepareHydratedValue(value, column));
	}

	return result;
}
