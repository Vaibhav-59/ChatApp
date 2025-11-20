require("dotenv").config();
const path = require("path");
const express = require("express");
const cors = require("cors");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
// Allow socket origins; include common Vite ports (5173, 5174)
const socketAllowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
];
const io = new Server(server, { cors: { origin: socketAllowedOrigins, methods: ["GET", "POST"] } });
const { setIO } = require("./utils/socket");
setIO(io);

// safer require to surface which module fails during startup (helps with path-to-regexp errors)
function safeRequire(modulePath) {
  try {
    const mod = require(modulePath);
    console.log(`Required module: ${modulePath}`);
    return mod;
  } catch (err) {
    console.error(`Failed to require module '${modulePath}':`, err);
    throw err;
  }
}

const authRoute = safeRequire("./router/auth-router");
const contactRoute = safeRequire("./router/contact-router");
const usersRoute = safeRequire("./router/users-router");
const analyticsRoute = safeRequire("./router/analytics-router");
const messageRoute = safeRequire("./router/message-router");
const connectDb = require("./utils/db");
const errorMiddleware = require("./middlewares/error-middleware");

//let's tackle cors
// CORS for HTTP routes: allow the dev origins used by Vite (5173/5174).
const allowedOrigins = ['http://localhost:5173', 'http://localhost:5174'];
const corsOptions = {
  origin: function (origin, callback) {
    // allow requests with no origin (like curl, server-to-server)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));

// Allow larger payloads for base64 images (avatars)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Serve client build in production
const rootDir = path.resolve();
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(rootDir, "../client/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(rootDir, "../client/dist/index.html"));
  });
}

//? app.use(express.json( ));: •This line of, code adds Express middleware that •parses•incoming request bodies with JSON payloads. It is important to place this before•any routes •that • need to handle JSON data in the request body. •This middleware is responsible for parsing JSON data• from• requests, •and it should be applied at the beginning of your middleware stack to ensure it's available for all subsequent route handlers.

// Mount routers with a small wrapper to surface which mount fails with path-to-regexp errors
function safeMount(prefix, router, verb = 'use') {
  try {
    if (verb === 'use') app.use(prefix, router);
    else if (verb === 'get') app.get(prefix, router);
    else app.use(prefix, router);
    console.log(`Mounted route: ${prefix}`);
  } catch (err) {
    console.error(`Failed to mount route '${prefix}':`, err);
    throw err; // rethrow so startup still fails, but with clearer log
  }
}

safeMount("/api/auth", authRoute);

safeMount("/api/users", usersRoute);

// app.get("/", (req,res) => { //programe
//   res.status(200).send("Welcome to world best mern series by vaibhav technical");
// });

// app.get("/register", (req,res) => { //programe
//   res.status(200).send("Welcome to registration page");
// });

app.use("/api/analytics", analyticsRoute);
app.use("/api/messages", messageRoute);
app.use("/api/form", contactRoute);

app.use(errorMiddleware)

const PORT = process.env.PORT || 5000;  //create (use env var when provided)

connectDb().then(() => {
  // handle common listen errors (useful during development)
  server.on('error', (err) => {
    if (err && err.code === 'EADDRINUSE') {
      console.error(`Port ${PORT} is already in use. Stop the process using that port or set a different PORT.`);
      process.exit(1);
    }
    console.error('Server error:', err);
    process.exit(1);
  });

  server.listen(PORT, () => { //listen via http server for socket.io
    console.log(`server is running at port: ${PORT}`);
  });
});
