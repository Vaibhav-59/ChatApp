//? Schema: defines the structure of the documents whithin a collection.it specifies the fields their types , and any additional contraints or validations

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      require: true,
      trim: true,
    },
    email: {
      type: String,
      require: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      require: true,
      trim: true,
    },
    password: {
      type: String,
      require: true,
    },
    // New fields to satisfy user management API
    avatar: {
      type: String, // URL to avatar
      default: "",
      trim: true,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    // Keep legacy admin flag for backward compatibility
    isAdmin: {
      type: Boolean,
      require: false,
      default: false,
    },
  },
  { timestamps: true }
);

//secure the password with the bcrypt using pre method
userSchema.pre("save", async function (next) {
  const user = this;

  if (!user.isModified("password")) {
    return next();
  }

  try {
    const saltRound = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, saltRound);
    next();
  } catch (error) {
    next(error);
  }
});

//compare the password
userSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
}

//* What is JWT?
// - JSON Web Token (jwt) is an open standard(RFC 7519) that defines a compact and seft-contained way for securely transmitting information between parties as a json object.
//? -JWTs are often used for authentication and authorization in web applications.
//? 1. Authentication: Verifying the indentity of a user or client.
//? 2. Authorization: Determinig what actions a user or client is allowed to perform.

//* Components of a JWT
// - Header: contains metadata about the token, such as the type of token and the signing algorithm being used.
// - Payload: contains claims or statements about an entity (typically, the user) and additional data. common claims include user ID, username, and expiration time.
// - Signature: To verify that the sender of the jwt is who it says it is and to ensure that the message wasn't changed along the way, a signature is included.

userSchema.methods.generateToken = function () {
  try {
    return jwt.sign({
      userId: this._id.toString(),
      email: this.email,
      isAdmin: this.isAdmin || this.role === "admin",
      role: this.role,
    },
      process.env.JWT_SECRET_KEY,
      {
        expiresIn: "30d",
      }
    );
  } catch (error) {
    console.error(error);
  }
};

//? Model.Acts as a higher-level abstration that interacts with the database based on the defined schema. it represents a collection and provides an interface for querying , creatign updating , and deleting documents in that collection Models are created from schemas and enable you to work with mongodb data in a more structured manner in your application.

const User = new mongoose.model("User", userSchema);
module.exports = User;