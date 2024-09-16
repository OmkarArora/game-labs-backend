require("dotenv").config();

const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { initDBConnection } = require("./db.connect");
const { requestInfo, errorHandler } = require("./middleware/middleware");

const { User } = require("./models/user.model");

const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use(requestInfo);

initDBConnection();

const usersRouter = require("./routers/users.router");
app.use("/users", usersRouter);

const userFixedPlaylists = require("./routers/user-fixed-playlists.router");
app.use("/user-fixed-playlists", userFixedPlaylists);

const playlistsRouter = require("./routers/playlists.router");
app.use("/playlists", playlistsRouter);

const videosRouter = require("./routers/videos.router");
app.use("/videos", videosRouter);

const categoriesRouter = require("./routers/categories.router");
app.use("/categories", categoriesRouter);

app.get("/", (req, res) => {
  res.send("Connected to Game LABS server");
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({
        success: false,
        message: "Email not found",
        errorMessage: "Email not found",
      });
    }
    const validPassword = await bcrypt.compare(password, user.password);

    if (validPassword) {
      const token = jwt.sign(
        { userId: user._id, email: user.email },
        process.env.JWT_SECRET
      );
      res.json({
        success: true,
        message: "Login success",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        token,
      });
    } else {
      res.json({ success: false, message: "Invalid password" });
    }
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "User not found",
      errorMessage: error.message,
    });
  }
});

// catching errors
app.use(errorHandler);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
  console.log("SERVER STARTED on port: ", PORT);
});
