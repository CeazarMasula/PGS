import Bcryptjs from "bcryptjs";
import Users from "../models/users";
import Products from "../models/products";
import Token from "../config/jwt";
import R from "ramda";
import Jwt from "jsonwebtoken";
import { generateId, EntityType } from "../schemas/generate-ids";
import { UserInputError } from "apollo-server-errors";
import { EmailAddressResolver } from "graphql-scalars";
import BinaryResolver from "../schemas/scalars/binary";
import {BinaryQueryOperatorInput,StringQueryOperatorInput} from "./convert-mongoose"
import {convertToMongooseQuery} from "./convert-filter"
import { paginate } from "./pagination";

export const resolvers = {
  Query: {
    hello: (): String => {
      return "WEW";
    },

    node: async (_parent: unknown, params: { id: Buffer }) => {
      const type = R.head(params.id as unknown as [number]);

      if (type === EntityType.Account) {
        return Users.findOne({ id: params.id });
      }

      if (type === EntityType.Product) {
        return Products.findOne({ id: params.id });
      }

      throw new UserInputError("Invalid Id");
    },

    products: async (_parent: unknown,  params: {
      first?: number,
      after?: Buffer,
      last?: number,
      before?: Buffer,
      sort?: {
        name: number
      }
      filter?: {
        id: BinaryQueryOperatorInput,
        name: StringQueryOperatorInput
      }
    },) => {

      return await paginate({
        model: Products,
        first: params.first?params.first:10,
        after: params.after,
        last: params.last,
        before: params.before,
        sort: params.sort ? { cursor: params.sort.name } : { cursor: 1 },
        filter: params.filter ? convertToMongooseQuery(params.filter) : {},

      })
    },
  },
  Node: {
    __resolveType(root: { id: Buffer }) {
      const type = R.head(root.id as unknown as [number]);
      return EntityType[type];
    },
  },

  Product: {
    owner: async (root, _params, _context) => {
      return Users.findOne({ id: root.ownerId });
    },
  },

  Mutation: {
    signUp: async (_: never, { input }) => {
      const { emailAddress, firstname, lastname, password } = input;
      const id = generateId(EntityType.Account);

      const userExists = await Users.exists({ emailAddress });
      if (userExists) {
        throw new UserInputError("Email address already used.");
      }

      const postUser = await Users.create({
        id,
        emailAddress,
        firstname,
        lastname,
        password: await Bcryptjs.hash(password, 10),
      });

      const timeInMilliseconds = new Date().getTime();
      const expirationTime =
        timeInMilliseconds + Number(Token.expireTime) * 10_000;
      const expireTimeInSeconds = Math.floor(expirationTime / 1_000);

      const token = await Jwt.sign(
        {
          id: postUser.id,
        },
        Token.secret,
        {
          issuer: Token.issUser,
          algorithm: "HS256",
          expiresIn: expireTimeInSeconds,
        }
      );

      return { token };
    },

    authenticate: async (_: never, { input }) => {
      const { emailAddress, password } = input;

      const foundUser = await Users.findOne({ emailAddress });
      if (!foundUser) {
        throw new UserInputError("User not registerd");
      }

      const passwordIsValid = await Bcryptjs.compare(
        password,
        foundUser.password
      );

      if (passwordIsValid) {
        const timeInMilliseconds = new Date().getTime();
        const expirationTime =
          timeInMilliseconds + Number(Token.expireTime) * 10_000;
        const expireTimeInSeconds = Math.floor(expirationTime / 1_000);

        const token = await Jwt.sign(
          {
            id: foundUser.id,
          },
          Token.secret,
          {
            issuer: Token.issUser,
            algorithm: "HS256",
            expiresIn: expireTimeInSeconds,
          }
        );
        return { token };
      } else {
        throw new UserInputError("Unauthorized");
      }
    },

    createProduct: async (_: never, { input }, ctx) => {
      const { name, description } = input;
      const ownerId = ctx.user.id;

      const id = generateId(EntityType.Product);

      const cursor = Buffer.concat([Buffer.from(name), Buffer.from(id)]);

      return Products.create({
        id,
        name,
        description,
        ownerId,
        cursor,
      });
    },

    updateProduct: async (_: never, { input }, ctx) => {
      const { id: ownerId } = ctx.user;
      const { id, body } = input;
      const product = await Products.findOne({ id });

      if (!product) {
        throw new UserInputError("Product does not exist");
      }
      if (!R.equals(product.ownerId, ownerId)) {
        throw new UserInputError("Not the owner of the product");
      }
      if (body.name) {
        product.name = body.name;
        product.cursor = Buffer.concat([
          Buffer.from(body.name),
          Buffer.from(product.id),
        ]);
      }
      if (body.description) {
        product.description = body.description;
      }

      await product.save();
      return product;
    },

    deleteProduct: async (_: never, { input }, ctx) => {
      const ownerId = ctx.user.id;
      const { id } = input;

      const foundProduct = await Products.findOne({ id });

      if (!foundProduct) {
        throw new UserInputError("Product does not exist");
      }

      if (!R.equals(foundProduct.ownerId, ownerId)) {
        throw new UserInputError("Not the owner of the product");
      }

      await foundProduct.deleteOne();
      return true;
    },
  },

  EmailAddress: EmailAddressResolver,
  Binary: BinaryResolver,
};
