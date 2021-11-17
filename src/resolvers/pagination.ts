import { Document, FilterQuery, Model } from 'mongoose';
import R from 'ramda';

export async function paginate<TDocument extends Document>(params: {
  model: Model<TDocument>;
  first?: number;
  after?: Buffer;
  last?: number;
  before?: Buffer;
  filter?: FilterQuery<TDocument>;
  sort: Record<string, number>;
}) {
  const { first, after, last, before, sort, filter = {}, model } = params;
  const [cursorKey] = R.keys(sort);
  const order = sort[cursorKey];

  let items: TDocument[] = [];
  let hasNextPage = false;
  let hasPreviousPage = false;
  let startCursor: Buffer | null = null;
  let endCursor: Buffer | null = null;

  if (first) {
    const cursorFilter = after
      ? {
          [`${cursorKey}`]: order > 0 ? { $gt: after } : { $lt: after },
        }
      : {};

    const results = await model
      .find({
        ...filter,
        ...cursorFilter,
      })
      .sort(sort)
      .limit(first + 1);

    if (results.length > 0) {

      items = results.length > first ? R.init(results) : results;

      hasNextPage = results.length > first;
      startCursor = (R.head(items).cursor)
      endCursor = (R.last(items).cursor)

      const previousItemcursorFilter = {
        [`${cursorKey}`]:
          order > 0 ? { $lt: startCursor } : { $gt: startCursor },
      };

      const previousItem = await model
        .findOne({
          ...filter,
          ...previousItemcursorFilter,
        })
        .sort({ [`${cursorKey}`]: -order });

      hasPreviousPage = !!previousItem;
    }
  } else if (last) {

    const cursorFilter = before
      ? {
          [`${cursorKey}`]: order > 0 ? { $lt: before } : { $gt: before },
        }
      : {};

    const results = R.reverse(
      await model
        .find({
          ...filter,
          ...cursorFilter,
        })
        .sort({ [`${cursorKey}`]: -order })
        .limit(last + 1),
    );

    if (results.length > 0) {

      items = results.length > last ? R.tail(results) : results;

      hasPreviousPage = results.length > last;
      startCursor = (R.head(items).cursor);
      endCursor = (R.last(items).cursor);

      const nextItemcursorFilter = {
        [`${cursorKey}`]: order > 0 ? { $gt: endCursor } : { $lt: endCursor },
      };

      const nextItem = await model
        .findOne({
          ...filter,
          ...nextItemcursorFilter,
        })
        .sort(sort);

      hasNextPage = !!nextItem;
    }
  }

  return {
    edges: R.map(
      (item) => ({
        node: item,
        cursor: item.cursor,
      }),
      items,
    ),
    pageInfo: {
      hasNextPage,
      hasPreviousPage,
      startCursor,
      endCursor,
    },
  };
}