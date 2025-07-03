import { DateTime } from 'luxon';
import type { BaseEntity, EntityMetadata, EntityTarget, ValueTransformer } from 'typeorm';
import { ApplicationError } from '~/utils/index.js';
import dataSource from './index.js';

export class DateTimeValueTransformer implements ValueTransformer {
	from(value: Date | null) {
		if (!value) {
			return null;
		}

		const dateTime = DateTime.fromJSDate(value);

		if (dateTime.isValid) {
			return dateTime;
		}

		throw new ApplicationError('Invalid date.', { value });
	}

	to(value: DateTime<true> | null) {
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

	return setValues(entity, metadata, raw);
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

	return setValues(entity, metadata, raw);
}

function setValues(
	entity: BaseEntity,
	metadata: EntityMetadata,
	raw: Record<string, unknown>
) {
	for (const column of metadata.columns) {
		if (column.isVirtual) {
			continue;
		}

		const value = raw[column.databaseName];

		column.setEntityValue(entity, dataSource.driver.prepareHydratedValue(value, column));
	}

	return entity;
}
