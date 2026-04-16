import express from "express";
import bodyParser from "body-parser";
import nodemailer from "nodemailer";
import "dotenv/config";

const app = express();
const port = process.env.PORT || 3000;

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_ADMIN,
        pass: process.env.EMAIL_PASS,
    }
});

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

app.get("/contact", (req,res) => {
    res.render("contact.ejs");
});

app.post("/contact", async (req,res) => {
    const {name, email, message} = req.body;
    try{
        await transporter.sendMail({
            from: process.env.EMAIL_ADMIN,
            to: process.env.EMAIL_ADMIN,
            replyTo: email,
            subject: `New message from ${name}`,
            text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
        });
        res.render("contact.ejs", { success: true });
    }
    catch (error){
        console.error(error);
        res.render("contact.ejs", {success: false});
    }
});

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});



