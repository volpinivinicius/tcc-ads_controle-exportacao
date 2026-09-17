const path = require("path");
const express = require("express");
const cookieParser = require("cookie-parser");
const routes = require("./routes");
const loginRoutes = require("./routes/loginRoutes");
const viewRoutes = require("./routes/viewRoutes");
const { requireWebAuth } = require("./middlewares/webAuthMiddleware");
const { notFound, errorHandler } = require("./middlewares/errorMiddleware");

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "..", "views"));
app.use(express.static(path.join(__dirname, "..", "public")));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // for the login form's POST body

app.use("/api", routes); // JSON API — its own Bearer-token auth (authMiddleware)
app.use("/", loginRoutes); // GET/POST /login, POST /logout — reachable without a session
app.use(requireWebAuth); // everything below requires a valid session cookie
app.use("/", viewRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;