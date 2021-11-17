import Request from "supertest";
import { expect } from "chai";
import { startServer } from "../../src/index";
import Products from "../../src/models/products";
import {
  addFakeProduct,
  addFakeUserRegister,
  getToken,
} from "../helpers/helpers";
import { generateId, EntityType } from "../../src/schemas/generate-ids";

const deleteProductMutation = `
            mutation($input:DeleteProductInput!){
                deleteProduct(input: $input)
            }
        `;

describe("Mutation.deleteProduct", () => {
  after(async function () {
    await Products.deleteMany({});
  });

  it("should delete product", async function () {
    const ownerId = generateId(EntityType.Account);

    await addFakeUserRegister({ ownerId });
    const product = await addFakeProduct({ ownerId });
    const token = await getToken({ ownerId });
    const { body } = await Request(startServer)
      .post("/graphql")
      .send({
        query: deleteProductMutation,
        variables: {
          input: {
            id: product.id.toString("base64"),
          },
        },
      })
      .set("Authorization", `Bearer ${token}`);

    expect(body.data.deleteProduct).to.true;
  });

  it("should error if not the owner", async function () {
    const ownerId = generateId(EntityType.Account);

    await addFakeUserRegister({ ownerId });
    const product = await addFakeProduct({ownerId:generateId(EntityType.Account)});
    const token = await getToken({ ownerId });
    const { body } = await Request(startServer)
      .post("/graphql")
      .send({
        query: deleteProductMutation,
        variables: {
          input: {
            id: product.id.toString("base64"),
          },
        },
      })
      .set("Authorization", `Bearer ${token}`);

    expect(body.errors[0].message).to.equal("Not the owner of the product");
  });

  it("should error if no token", async function () {
    const ownerId = generateId(EntityType.Account);

    await addFakeUserRegister({ ownerId });
    const product = await addFakeProduct({ownerId:generateId(EntityType.Account)});
    const token = await getToken({ ownerId });
    const { body } = await Request(startServer)
      .post("/graphql")
      .send({
        query: deleteProductMutation,
        variables: {
          input: {
            id: product.id.toString("base64"),
          },
        },
      })

    expect(body.errors[0].message).to.equal("Invalid authentication header.");
  });

  it("should Error if product does not exist", async function () {
    const ownerId = generateId(EntityType.Account);
    await addFakeUserRegister({ ownerId });
    const token = await getToken({ ownerId });
    const { body } = await Request(startServer)
      .post("/graphql")
      .send({
        query: deleteProductMutation,
        variables: {
          input: {
            id: generateId(EntityType.Account).toString("base64"),
          },
        },
      })
      .set("Authorization", `Bearer ${token}`);

    expect(body.errors[0].message).to.equal("Product does not exist");

  });
});
