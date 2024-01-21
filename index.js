const { faker } = require("@faker-js/faker");
const mysql = require("mysql2");
const express = require("express");
const app = express();
const path = require("path");
const methodOverride = require("method-override");
const { v4: uuidv4 } = require('uuid');

app.use(methodOverride("_method"));
app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  database: 'college',
  password: 'enterYourSQLPassword',
});

const port = 8080;

app.get("/", (req, res) => {
  let q = `SELECT COUNT(*) AS userCount FROM user`;

  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      let count = result[0]["userCount"];
      console.log(result); // Log the result to inspect its structure
      res.render("home.ejs", { count });
    });
  } catch (err) {
    console.log(err);
    res.send("Some error in DB");
  }
});
//SHOW ROUTE
app.get("/user", (req, res) => {
  let q = `SELECT * FROM college.user`;

  try {
    connection.query(q, (err, users) => {
      if (err) throw err;
      res.render("showusers.ejs", { users });
      // console.log(result);
      // res.send(result);
    });
  } catch (err) {
    console.log(err);
    res.send("Some error in DB");
  }
});
//EDIT ROUTE
app.get("/user/:id/edit", (req, res) => {
  let { id } = req.params;
  console.log(id);
  let q = `SELECT * FROM college.user WHERE id='${id}'`;
  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      let user = result[0];
      res.render("edit.ejs", { user });
    });
  } catch (err) {
    console.log(err);
    res.send("Some error in DB");
  }
});
//UPDATE ROUTE
app.patch("/user/:id", (req, res) => {
  let { id } = req.params;
  let { password: formPass, username: newUserName } = req.body;
  let q = `SELECT * FROM college.user WHERE id='${id}'`;
  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      let user = result[0];
      if(formPass != user.password) {
        res.send("Incorrect password entered!")
      }
      else {
        let q2 = `UPDATE college.user SET username='${newUserName}' WHERE id='${id}'`;
        connection.query(q2, (err, result) => {
          if(err) throw err;
          res.redirect("/user");
        });
      }
    });
  } catch (err) {
    console.log(err);
    res.send("Some error in DB");
  }
});
// ADD NEW USER ROUTE
app.get("/user/add", (req, res) => {
  res.render("adduser.ejs");
});

// ADD NEW USER ROUTE
app.post("/user/add", (req, res) => {
  const { email, username, password } = req.body;
  const userId = uuidv4(); // Generate a UUID for the user

  // Sample SQL query for inserting a new user
  const q = `INSERT INTO college.user (id, email, username, password) VALUES ('${userId}', '${email}', '${username}', '${password}')`;

  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      res.redirect("/user");
    });
  } catch (err) {
    console.log(err);
    res.send("Some error in DB");
  }
});

// DELETE USER ROUTE
app.get("/user/:id/delete", (req, res) => {
  let { id } = req.params;
  res.render("deleteUser.ejs", { userId: id });
});
app.delete("/user/:id/delete", (req, res) => {
  let { id } = req.params;
  let { email, password } = req.body;

  // Check if email and password match
  // Perform the deletion if credentials are correct

  // Example SQL query (replace with your logic)
  let q = `DELETE FROM college.user WHERE id='${id}' AND email='${email}' AND password='${password}'`;

  try {
    connection.query(q, (err, result) => {
      if (err) throw err;

      // Check if any rows were affected (user deleted)
      if (result.affectedRows > 0) {
        res.redirect("/user");
      } else {
        res.send("Incorrect email or password. User not deleted.");
      }
    });
  } catch (err) {
    console.log(err);
    res.send("Some error in DB");
  }
});
/*
process.on("SIGINT", () => {
  console.log("Closing the MySQL connection.");
  connection.end();
  process.exit();
});
*/

app.listen(port, () => {
  console.log(`Server is listening to ${port}`);
});
