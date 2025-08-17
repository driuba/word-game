import { DateTime } from 'luxon';
import type {
	BaseEntity,
	DeleteQueryBuilder,
	EntityManager,
	EntityMetadata,
	EntityTarget,
	InsertQueryBuilder,
	UpdateQueryBuilder,
	ValueTransformer
} from 'typeorm';
import { ApplicationError } from '~/utils/index.js';

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

export async function deleteEntity<T extends BaseEntity>(entity: T, target: EntityTarget<T>, entityManager?: EntityManager) {
	const { default: dataSource } = await import('./index.js');

	const metadata = dataSource.getMetadata(target);

	const repository = (entityManager ?? dataSource).getRepository(target);

	return await execute(
		repository
			.createQueryBuilder()
			.delete()
			.where(
				Object.fromEntries(
					metadata.columns
						.filter(c => c.isPrimary)
						.map(c => [c.propertyName, c.getEntityValue(entity)])
				)
			),
		entity,
		metadata
	);
}

/**
 * `insert` and `update` functions are inspired by *typeorm-deserializer* and a couple of *typeorm* GitHub issues
 * https://github.com/mdevecka/typeorm-deserializer/blob/master/src/typeorm-deserializer.ts
 * https://github.com/typeorm/typeorm/issues/6803#issuecomment-864681382
 * https://github.com/typeorm/typeorm/issues/9870#issuecomment-1594665438
 */
export async function execute<T extends BaseEntity>(
	builder: DeleteQueryBuilder<T> | InsertQueryBuilder<T> | UpdateQueryBuilder<T>,
	entity: T,
	metadata: EntityMetadata
) {
	const { raw: [raw] } = await builder
		.returning('*')
		.execute() as { raw: [Record<string, unknown>?] };

	if (!raw) {
		return entity;
	}

	for (const column of metadata.columns) {
		if (column.isVirtual) {
			continue;
		}

		const value = raw[column.databaseName];

		column.setEntityValue(entity, builder.connection.driver.prepareHydratedValue(value, column));
	}

	return entity;
}

export async function insertEntity<T extends BaseEntity>(entity: T, target: EntityTarget<T>, entityManager?: EntityManager) {
	const { default: dataSource } = await import('./index.js');

	const metadata = dataSource.getMetadata(target);

	const repository = (entityManager ?? dataSource).getRepository(target);

	return await execute(
		repository
			.createQueryBuilder()
			.insert()
			.values(
				Object.fromEntries(
					metadata.columns
						.filter(c =>
							c.isInsert &&
							!(
								c.isGenerated ||
								c.isVirtual
							)
						)
						.map(c => [c.propertyName, c.getEntityValue(entity)])
				) as object & T
			),
		entity,
		metadata
	);
}

export async function updateEntity<T extends BaseEntity>(entity: T, target: EntityTarget<T>, entityManager?: EntityManager) {
	const { default: dataSource } = await import('./index.js');

	const metadata = dataSource.getMetadata(target);

	const repository = (entityManager ?? dataSource).getRepository(target);

	return await execute(
		repository
			.createQueryBuilder()
			.update()
			.set(
				Object.fromEntries(
					metadata.columns
						.filter(c =>
							c.isUpdate &&
							!(
								c.isGenerated ||
								c.isVirtual
							)
						)
						.map(c => [c.propertyName, c.getEntityValue(entity)])
				) as object & T
			)
			.where(
				Object.fromEntries(
					metadata.columns
						.filter(c => c.isPrimary)
						.map(c => [c.propertyName, c.getEntityValue(entity)])
				)
			),
		entity,
		metadata
	);
}
