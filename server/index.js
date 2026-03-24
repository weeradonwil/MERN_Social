const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const cors = require("cors");
const upload = require("express-fileupload");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const routes = require("./routes/routes");
const { server, app } = require("./socket/socket.js")
const dns = require("dns");

dns.setServers(["8.8.8.8", "1.1.1.1"]);



app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors({ credentials: true, origin: ["http://localhost:5173"] }));
app.use(upload())

app.use("/api", routes);

app.use(notFound);
app.use(errorHandler);

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("MongoDB connected ✅");

    server.listen(process.env.PORT, () =>
      console.log(`Server started on port ${process.env.PORT}`)
    );
  })
  .catch((err) => console.log("MongoDB error ❌", err));