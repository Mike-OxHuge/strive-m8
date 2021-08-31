import server from "./server.js";
import supertest from "supertest";
import mongoose from "mongoose";

import dotenv from "dotenv";
dotenv.config();

const request = supertest(server);

describe("Testing tests", () => {
  it("should test that true is true", () => {
    expect(true).toBe(true);
  });
});

describe("testing endpoints", () => {
  beforeAll((done) => {
    mongoose.connect(`${process.env.MONGO_CONNECTION}/test`, () => {
      console.log("Connected to Mongo!");
      done();
    });
  });

  /* ~~~~~~ tests ~~~~~~ */
  const validProduct = {
    name: "iPhone",
    price: 420,
  };

  it("should test that the /test endpoint is returning 200 and a success message", async () => {
    const response = await request.get("/api/v1/jest-test");

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Test success!");
  });

  it("should test POST a new product", async () => {
    const response = await request.post("/api/v1/jest-test").send(validProduct);

    expect(response.status).toBe(201);
    expect(response.body.name).toBe(validProduct.name);
  });

  // it("should return a single product's id along with a success message");
  // const response = await request.get(
  //   "/api/v1/jest-test/5e9f9f9f9f9f9f9f9f9f9f9"
  // );
  /* ^ TESTS ^ */

  afterAll((done) => {
    mongoose.connection.dropDatabase().then(() => {
      mongoose.connection.close();
      done();
    });
  });
});
