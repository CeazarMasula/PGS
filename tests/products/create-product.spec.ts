import Request from "supertest";
import Bcryptjs from "bcryptjs";
import { expect } from "chai";
import { startServer } from "../../src/index";
import Products from "../../src/models/products";
import Users from "../../src/models/users";
import {
  generateFakeUser,
  generateFakeProduct,
  getToken,
} from "../helpers/helpers";
import { generateId, EntityType } from "../../src/schemas/generate-ids";

const createProductMutation = `
            mutation($input:CreateProductInput!){
                createProduct(input: $input){
                    name,
                    description
                }
            }
        `;

describe("Mutation.createProduct", () => {
  after(async function () {
    await Products.deleteMany({});
  });

  it("should create product", async function () {
    const createdUser = generateFakeUser();
    const ownerId = generateId(EntityType.Account);
    await Users.create({
      ...createdUser,
      id:ownerId,
      password: await Bcryptjs.hash(createdUser.password, 10),
    });
    const token = await getToken({ownerId});

    const res = await Request(startServer)
      .post("/graphql")
      .send({
        query: createProductMutation,
        variables: {
          input: generateFakeProduct(),
        },
      })
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).to.equal(200);
  });

  it("should error if no token", async function () {

    const res = await Request(startServer)
      .post("/graphql")
      .send({
        query: createProductMutation,
        variables: {
          input: generateFakeProduct(),
        },
      });
    const body = JSON.parse(res.text);
    expect(body.errors[0].message).to.equal("Invalid authentication header.");
  });

  it("should error if invalid token", async function () {
    const createdUser = generateFakeUser();

    await Users.create({
      ...createdUser,
      id: generateId(EntityType.Account),
      password: await Bcryptjs.hash(createdUser.password, 10),
    });

    const res = await Request(startServer)
      .post("/graphql")
      .send({
        query: createProductMutation,
        variables: {
          input: generateFakeProduct(),
        },
      })
      .set("Authorization", `Bearer 2sdjflskdjfklsdj5`);

    const body = JSON.parse(res.text);
    expect(body.errors[0].message).to.equal("jwt malformed");
  });
});
