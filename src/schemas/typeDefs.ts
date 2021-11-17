import { gql } from "apollo-server-koa";
import { mutations } from "./mutations";
import { query } from "./query";
import { scalars } from "./scalars";
import { types } from "./types";

export const typeDefs = gql`
  ${mutations}
  ${query}
  ${scalars}
  ${types}
`;

