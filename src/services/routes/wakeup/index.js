import express from "express";

const router = express.Router();

router.route("/").get(async (req, res, next) => {
  try {
    res.status(200).send(`
      Server is awake and further requests will go at normal speed!
      This is made for free heroku tier, so this endpoint is called upon inital load.
      `);
  } catch (error) {
    console.log(error);
  }
});

export default router;
