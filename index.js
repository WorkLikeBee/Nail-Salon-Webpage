import express from "express";
import bodyParser from "body-parser";

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req,res) => {
    res.render("index.ejs");
});

app.get("/about", (req,res) => {
    res.render("about.ejs");
});

app.get("/services", (req,res) => {
    res.render("services.ejs");
});

app.get("/FAQ", (req,res) => {
    res.render("FAQ.ejs");
});

app.get("/gallery", (req,res) => {
    res.render("gallery.ejs");
});

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
})



