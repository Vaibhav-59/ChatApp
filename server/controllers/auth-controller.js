//? In an Express. js application, a "controller" refers to a part of your code that is responsible for handling the application's logic. Controllers are typically used to process incoming requests, interact with models (data sources), and send responses back to clients. They help organize your application by separating concerns and following the MVC (Model-View-Controller)design pattern.

const User = require("../models/user-model");
const { incrementTotalUsers } = require("../services/analytics-service");

const home = async (req,res) => {
  try {
    res 
      .status(200)
      .send("Welcome to world best mern series by vaibhav using router")
  }catch(error){
    console.log(error);
  }
};

//* register user logic

const register = async (req,res) => {
  try{
    // console.log(req.body);
    const { username, email,phone, password } = req.body;

    const userExist = await User.findOne({ email });

    if(userExist) {
      return res.status(400).json({ msg: "email already exists"});
    }

    // hase the password
    // const saltRount = 10;
    // const hash_password = await bcrypt.hash(password, saltRount);

    // Decide role: first user or matched admin email becomes admin
    let role = 'user';
    try {
      const total = await User.countDocuments();
      const adminEmail = process.env.ADMIN_EMAIL && String(process.env.ADMIN_EMAIL).toLowerCase();
      if (total === 0 || (adminEmail && String(email).toLowerCase() === adminEmail)) {
        role = 'admin';
      }
    } catch (_) { /* ignore */ }

    const userCreated = await User.create({ username, email, phone, password, role });

    // Fire-and-forget analytics increment; do not block user registration
    try { await incrementTotalUsers(); } catch (_) {}

    const token = await userCreated.generateToken();
    const safeUser = {
      _id: userCreated._id,
      username: userCreated.username,
      name: userCreated.username,
      email: userCreated.email,
      avatar: userCreated.avatar,
      role: userCreated.role,
    };
    res.status(201).json({ msg: "registration successful", token, userId: userCreated._id.toString(), user: safeUser });
  }catch(error){
    res.status(500).json("internal server error");
  }
};
//userCreated._id.toString : In most cases converting id to a string is a good practice because it ensures consistency and compatibility across diffrent jwt libraries and system it also aligns with the expectation that claims in a jwt are represented as strings

//* login user logic

const login = async (req, res) => {
  try{
    const { email, password } = req.body;

    const userExist = await User.findOne({ email });
    // console.log(userExist);

    if(!userExist){
      return res.status(400).json({ message: "Invalid Credentials" });
    }

    // const user = await bcrypt.compare(password, userExist.password);
    const user = await userExist.comparePassword(password);

    if(user){
      // If matches ADMIN_EMAIL and not already admin, promote and save
      try {
        const adminEmail = process.env.ADMIN_EMAIL && String(process.env.ADMIN_EMAIL).toLowerCase();
        if (adminEmail && String(userExist.email).toLowerCase() === adminEmail && (userExist.role !== 'admin' || userExist.isAdmin !== true)) {
          userExist.role = 'admin';
          userExist.isAdmin = true;
          await userExist.save();
        }
      } catch (_) { /* ignore */ }

      const token = await userExist.generateToken();
      const safeUser = {
        _id: userExist._id,
        username: userExist.username,
        name: userExist.username,
        email: userExist.email,
        avatar: userExist.avatar,
        role: userExist.role,
      };
      res.status(200).json({
        msg: "Login successful", 
        token, 
        userId: userExist._id.toString(),
        user: safeUser,
      });
    }else{
      res.status(401).json({ message: "Invalid email or password" });
    }
  }catch(error){
    //res.status(500).json("internal server error");
    next(error);
  }
};

//* send user data - user Logic

const user = async (req, res) => {
  try {
    // const userData = await User.find({});
    const userData = req.user;
    console.log(userData);
    return res.status(200).json({ userData });
  } catch (error) {
    console.log(` error from user route ${error}`);
  }
};

module.exports = {home, register, login, user};