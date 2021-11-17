import Request from "supertest";
import { internet, name, commerce } from "faker";
import Token from "../../src/config/jwt";
import Users from "../../src/models/users";
import Products from "../../src/models/products";
import { generateId, EntityType } from "../../src/schemas/generate-ids";
import R from "ramda";
import Jwt from "jsonwebtoken";
import Bcryptjs from "bcryptjs";


export function generateFakeUser() {
  return {
    emailAddress: internet.email(),
    firstname: name.firstName(),
    lastname: name.lastName(),
    password: internet.password(),
  };
}

export function generateFakeProduct() {
  return {
    name: commerce.product(),
    description: `This is ${commerce.product()}`,
  };
}

export async function getToken(params: { ownerId: Buffer }) {
  const id = params.ownerId;
  const foundUser = await Users.findOne({id});
  const timeInMilliseconds = new Date().getTime();
  const expirationTime = timeInMilliseconds + Number(Token.expireTime) * 10_000;
  const expireTimeInSeconds = Math.floor(expirationTime / 1_000);

  const token = await Jwt.sign(
    {
      id: foundUser?.id,
    },
    Token.secret,
    {
      issuer: Token.issUser,
      algorithm: "HS256",
      expiresIn: expireTimeInSeconds,
    }
  );

  return token ;
}

export async function addFakeProduct(params: { ownerId: Buffer }) {
  const generateProduct = generateFakeProduct();
  const ownerId = params.ownerId;
  const id = generateId(EntityType.Product)
  const cursor = Buffer.concat([
    Buffer.from(generateProduct.name),
    Buffer.from(id),
  ]);
  const product = { ...generateProduct, id, cursor, ownerId };
  return Products.create(product);
}

export async function addFakeUserRegister(params: { ownerId: Buffer }) {
  const id = params.ownerId
  const generateUserInfo = generateFakeUser();
 
  return Users.create({
      ...generateUserInfo,
      id,
      password: await Bcryptjs.hash(generateUserInfo.password, 10),
    });
}

export async function populateProduct(count: number = 5) {
  Products.create(R.times(() => generateFakeProduct())(count))

}
