import express from "express";
import ProductModel from "./schema.js";
const router = express.Router();

router
  .route("/")
  .get(async (req, res) => {
    try {
      const products = await ProductModel.find();
      res.status(200).send({ products, message: "Test success!" });
    } catch (error) {
      console.log(error);
    }
  })
  .post(async (req, res) => {
    try {
      const product = new ProductModel(req.body);
      await product.save();
      res.status(201).send(product);
    } catch (error) {
      console.log(error);
    }
  });

router
  .route("/:id")
  .get(async (req, res) => {
    try {
      const id = req.params.id;
      const product = await ProductModel.findById(id);
      res.status(200).send({ message: "product found!", id: product._id });
    } catch (error) {
      console.log(error);
    }
  })
  .put(async (req, res) => {
    try {
    } catch (error) {
      console.log(error);
    }
  })
  .delete(async (req, res) => {
    try {
    } catch (error) {
      console.log(error);
    }
  });

export default router;
