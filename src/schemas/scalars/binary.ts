import { GraphQLScalarType } from "graphql";

const BinaryResolver = new GraphQLScalarType({
  name: "Binary",
  description: "String representation of a Buffer ID.",

  serialize(value) {
    if (!(value instanceof Buffer)) {
      throw new Error("Invalid return type for Binary");
    }
    return value.toString("base64");
  },

  parseValue(value) {
    return Buffer.from(value, "base64");
  },

  parseLiteral(ast: any) {
    return Buffer.from(ast.value, "base64");
  },
});

export default BinaryResolver;
