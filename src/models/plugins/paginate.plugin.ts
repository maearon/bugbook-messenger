/* eslint-disable no-param-reassign */
import {
  Schema,
  Model,
  Query,
  PopulateOptions,
  Document
} from 'mongoose';

export interface PaginateOptions {
  sortBy?: string;
  populate?: string;
  limit?: number | string;
  page?: number | string;
}

export interface QueryResult<T> {
  results: T[];
  page: number;
  limit: number;
  totalPages: number;
  totalResults: number;
}

/**
 * Mongoose paginate plugin (TypeScript safe, no any)
 */
export function paginatePlugin<T extends Document, M extends Model<T>>(
  schema: Schema<T, M>
): void {
  schema.static(
    'paginate',
    async function (
      this: Model<T>,
      filter: Record<string, unknown> = {},
      options: PaginateOptions = {}
    ): Promise<QueryResult<T>> {
      let sort = '';

      if (options.sortBy) {
        const sortingCriteria: string[] = [];
        options.sortBy.split(',').forEach((sortOption) => {
          const [key, order] = sortOption.split(':');
          sortingCriteria.push((order === 'desc' ? '-' : '') + key);
        });
        sort = sortingCriteria.join(' ');
      } else {
        sort = 'createdAt';
      }

      const limit =
        options.limit && parseInt(String(options.limit), 10) > 0
          ? parseInt(String(options.limit), 10)
          : 10;
      const page =
        options.page && parseInt(String(options.page), 10) > 0
          ? parseInt(String(options.page), 10)
          : 1;
      const skip = (page - 1) * limit;

      const countPromise = this.countDocuments(filter).exec();
      let query: Query<T[], T> = this.find(filter).sort(sort).skip(skip).limit(limit);

      if (options.populate) {
        options.populate.split(',').forEach((populateOption) => {
          type PopulateObj = { path: string; populate?: PopulateObj | null } | null;
          const populateObj = populateOption
            .split('.')
            .reverse()
            .reduce<PopulateObj>((prev, curr) => ({ path: curr, populate: prev }), null);

          query = query.populate(populateObj as PopulateOptions);
        });
      }

      const docsPromise = query.exec();

      const [totalResults, results] = await Promise.all([countPromise, docsPromise]);
      const totalPages = Math.ceil(totalResults / limit);

      return {
        results,
        page,
        limit,
        totalPages,
        totalResults,
      };
    }
  );
}

export default paginatePlugin;
