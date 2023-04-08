var mongoose = require("mongoose");
var Schema = mongoose.Schema;
const express = require("express");
const exphbs = require("express-handlebars");
const { Pool } = require("pg");
const config = require("./config");

// connect to MongoDB 
try{mongoose
  .connect(
    "mongodb+srv://vpatel:vishesh@cluster0.scbvbhk.mongodb.net/?retryWrites=true&w=majority"
  )
}
catch{
  console.log("ERROR: Db error");
}

const app = express();
const pool = new Pool(config.database);

app.engine(".hbs", exphbs.engine({ extname: ".hbs" }));
app.set("view engine", ".hbs");

var taskCheck = new Schema({
  taskDescript: String,
  completed: {
    type: Boolean,
    default: false,
  },
});
var tasks = mongoose.model("tasks", taskCheck);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

// Routes
app.get("/", async (req, res) => {
  
  tasks
    .find({})
    .lean()
    .exec()
    .then((todos) => {
    

      res.render("index", { todos, layout: false });
    });
});

app.post("/add", async (req, res) => {
  const taskData = req.body.task;

  if (taskData) {
  
    var todo = new tasks({
      taskDescript: taskData,
    });
    todo
      .save()
      .then(() => {
        res.redirect("/");
      })}
});

app.post("/complete/:id", async (req, res) => {
  const id = req.params.id;

  if (id) {

    tasks.findByIdAndUpdate(id, {completed: true}).exec().then(()=>{
      res.redirect("/");
    });
  }
});

app.get("/edit/:id", async (req, res) => {
  const id = req.params.id;

  if (id) {

    tasks
      .findById(id)
      .lean()
      .exec()
      .then((todo) => {
        res.render("edit", { todo, layout: false });
      })
    }
});

app.post("/update/:id", async (req, res) => {
  const id = req.params.id;
  const taskData = req.body.task;

  if (id && taskData) {
   
    tasks.findByIdAndUpdate(id, { taskDescript: taskData }).exec().then(()=>{
      res.redirect('/');
    })
  }
});

// Add this route after the existing routes
app.post("/delete/:id", async (req, res) => {
  const id = req.params.id;
  
  if (id) {
  
    tasks.findByIdAndRemove(id).exec().then(()=>{
      res.redirect('/');
     
    })
  }
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
