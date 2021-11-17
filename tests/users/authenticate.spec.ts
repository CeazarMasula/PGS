import Request from "supertest";
import Bcryptjs from "bcryptjs";
import { expect } from "chai";
import { startServer } from "../../src/index";
import Users from "../../src/models/users";
import { generateFakeUser } from "../helpers/helpers";
import { generateId, EntityType } from "../../src/schemas/generate-ids";

describe("Mutation.authenticate", () => {
  after(async function () {
    await Users.deleteMany({});
  });

  it("should authenticate successfully", async function () {
    const createdUser = generateFakeUser();

    await Users.create({
      ...createdUser,
      id:generateId(EntityType.Account),
      password: await Bcryptjs.hash(createdUser.password, 10),
    });
    const authenticatepMutation = `
            mutation($input:AuthenticateInput!){
              authenticate(input: $input){
                    token
                }
            }
        `;

    const res = await Request(startServer)
      .post("/graphql")
      .send({
        query: authenticatepMutation,
        variables: {
          input: {
            emailAddress:createdUser.emailAddress,
            password:createdUser.password
          }
        },
      });
    expect(res.statusCode).to.equal(200);
  });

  it("should error if password is invalid", async function () {
    const createdUser = generateFakeUser();

    await Users.create({
      ...createdUser,
      id:generateId(EntityType.Account),
      password: await Bcryptjs.hash(createdUser.password, 10),
    });
    const authenticatepMutation = `
            mutation($input:AuthenticateInput!){
              authenticate(input: $input){
                    token
                }
            }
        `;

    const res = await Request(startServer)
      .post("/graphql")
      .send({
        query: authenticatepMutation,
        variables: {
          input: {
            emailAddress:createdUser.emailAddress,
            password:"lkajsdf"
          }
        },
      });

      const body =JSON.parse(res.text)
    expect(body.errors[0].message).to.equal("Unauthorized");
  });

  it("should error if email is invalid", async function () {
    const createdUser = generateFakeUser();

    await Users.create({
      ...createdUser,
      id:generateId(EntityType.Account),
      password: await Bcryptjs.hash(createdUser.password, 10),
    });
    const authenticatepMutation = `
            mutation($input:AuthenticateInput!){
              authenticate(input: $input){
                    token
                }
            }
        `;

    const res = await Request(startServer)
      .post("/graphql")
      .send({
        query: authenticatepMutation,
        variables: {
          input: {
            emailAddress:"kasjhdfkjashfda",
            password:createdUser.password
          }
        },
      });

      const body =JSON.parse(res.text)
    expect(body.errors[0].message).to.equal("User not registerd");
  });
});
