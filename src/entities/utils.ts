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

// noinspection JSUnusedGlobalSymbols
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

// noinspection JSUnusedGlobalSymbols
export class FloatValueTransformer implements ValueTransformer {
	from(value: string) {
		return parseFloat(value);
	}

	to() {
		throw new Error('Not implemented.');
	}
}

// noinspection JSUnusedGlobalSymbols
export class IntValueTransformer implements ValueTransformer {
	from(value: string) {
		return parseInt(value);
	}

	to() {
		throw new Error('Not implemented.');
	}
}

export async function deleteEntity<T extends BaseEntity>(entity: T, target: EntityTarget<T>, entityManager?: EntityManager) {
	let repository = entityManager?.getRepository(target);

	if (!repository) {
		const { default: dataSource } = await import('./index.js');

		repository = dataSource.getRepository(target);
	}

	return await execute(
		repository
			.createQueryBuilder()
			.delete()
			.where(
				Object.fromEntries(
					repository.metadata.columns
						.filter((c) => c.isPrimary)
						.map((c) => [c.propertyName, c.getEntityValue(entity)])
				)
			),
		[entity],
		repository.metadata
	).then((es) => es[0]);
}

/**
 * `insert` and `update` functions are inspired by *typeorm-deserializer* and a couple of *typeorm* GitHub issues
 * https://github.com/mdevecka/typeorm-deserializer/blob/master/src/typeorm-deserializer.ts
 * https://github.com/typeorm/typeorm/issues/6803#issuecomment-864681382
 * https://github.com/typeorm/typeorm/issues/9870#issuecomment-1594665438
 */
export async function execute<T extends BaseEntity>(
	builder: DeleteQueryBuilder<T> | InsertQueryBuilder<T> | UpdateQueryBuilder<T>,
	entities: T[],
	metadata: EntityMetadata
) {
	const { raw: entitiesRaw } = await builder
		.returning('*')
		.execute() as { raw: Record<string, unknown>[] };

	for (let i = 0; i < entities.length; i++) {
		const entity = entities[i];
		const entityRaw = entitiesRaw[i];

		for (const column of metadata.columns) {
			if (column.isVirtual) {
				continue;
			}

			const value = entityRaw[column.databaseName];

			column.setEntityValue(entity, builder.connection.driver.prepareHydratedValue(value, column));
		}
	}

	return entities;
}

export async function insertEntities<T extends BaseEntity>(entities: T[], target: EntityTarget<T>, entityManager?: EntityManager) {
	let repository = entityManager?.getRepository(target);

	if (!repository) {
		const { default: dataSource } = await import('./index.js');

		repository = dataSource.getRepository(target);
	}

	return await execute(
		repository
			.createQueryBuilder()
			.insert()
			.values(
				entities.map((e) =>
					Object.fromEntries(
						repository.metadata.columns
							.filter((c) => c.isInsert && !(c.isGenerated || c.isVirtual))
							.map((c) => [c.propertyName, c.getEntityValue(e)])
					) as object & T
				)
			),
		entities,
		repository.metadata
	);
}
