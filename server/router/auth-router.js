//? In Express.js , express.Router() is a mini Express application without all the server configuration but with the ability to define routes , middleware , and even have its own set of route handlers. It allows you to modularize your routes and middleware to keep your code organized and maintainable.

//? Use the express.Router class to create modular , mountable route handlers. a router instance is complete middleware and routing system; for this reason , it is often referred to as a "mini-app".

const express = require("express");
const router = express.Router();
const authcontrollers = require("../controllers/auth-controller");
const validateSchema = require("../validators/auth-validator");
const validate = require("../middlewares/validate-middleware");
const authMiddleware = require("../middlewares/auth-middleware");



router.route("/").get(authcontrollers.home);

router
  .route("/register")
  .post(validate(validateSchema.signupSchema), authcontrollers.register);
router
  .route("/login")
  .post(validate(validateSchema.loginSchema), authcontrollers.login);

router.route("/user").get(authMiddleware, authcontrollers.user);

// Compatibility: provide /check endpoint used by the client to verify auth
router.route("/check").get(authMiddleware, authcontrollers.user);

module.exports = router;