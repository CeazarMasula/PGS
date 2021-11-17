import Request from "supertest";
import { expect } from "chai";
import { startServer } from "../../src/index";
import Users from "../../src/models/users";
import { addFakeUserRegister, getToken } from "../helpers/helpers";
import { generateId, EntityType } from "../../src/schemas/generate-ids";

describe("Mutation.me", () => {
  after(async function () {
    await Users.deleteMany({});
  });
  const meQuery = `
            query{
                me{
                    lastname
                    firstname
                    emailAddress
                  }
            }
        `;

  it("should display account", async function () {
    const ownerId = generateId(EntityType.Account);

    const user = await addFakeUserRegister({ ownerId });
    const token = await getToken({ ownerId });

    const { body } = await Request(startServer)
      .post("/graphql")
      .send({
        query: meQuery,
      })
      .set("Authorization", `Bearer ${token}`);

    expect(body.data.me.emailAddress).to.equal(user.emailAddress);
  });

  it("should error if no token", async function () {

    const { body } = await Request(startServer)
      .post("/graphql")
      .send({
        query: meQuery,
      })

    expect(body.errors[0].message).to.equal("Invalid authentication header.");
  });
});
