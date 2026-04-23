import express from "express";
import bodyParser from "body-parser";
import nodemailer from "nodemailer";
import "dotenv/config";
import pg from "pg";
import bcrypt from "bcrypt";
import passport from "passport";
import { Strategy } from "passport-local";
import session from "express-session";

const app = express();
const port = process.env.PORT || 3000;

const db = new pg.Client({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PASSWORD,
    port: process.env.PG_PORT,
});

try {
    await db.connect();
    console.log("Connected to PostgreSQL");
} catch (err) {
    console.error("Failed to connect to PostgreSQL:", err.message);
    process.exit(1);
}

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_ADMIN,
        pass: process.env.EMAIL_PASS,
    },
});

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
}));
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(passport.initialize());
app.use(passport.session());

// ─── Public Routes ────────────────────────────────────────────

app.get("/", (req, res) => res.render("index.ejs"));
app.get("/about", (req, res) => res.render("about.ejs"));
app.get("/services", (req, res) => res.render("services.ejs"));
app.get("/FAQ", (req, res) => res.render("FAQ.ejs"));
app.get("/gallery", (req, res) => res.render("gallery.ejs"));
app.get("/contact", (req, res) => res.render("contact.ejs"));

app.post("/contact", async (req, res) => {
    const { name, email, message } = req.body;
    try {
        await transporter.sendMail({
            from: process.env.EMAIL_ADMIN,
            to: process.env.EMAIL_ADMIN,
            replyTo: email,
            subject: `New message from ${name}`,
            text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
        });
        res.render("contact.ejs", { success: true });
    } catch (error) {
        console.error(error);
        res.render("contact.ejs", { success: false });
    }
});

// ─── Booking Routes ───────────────────────────────────────────

app.get("/booking", async (req, res) => {
    const [svcRes, techRes] = await Promise.all([
        db.query("SELECT * FROM services ORDER BY category, name"),
        db.query("SELECT * FROM technicians ORDER BY id"),
    ]);
    const today = new Date().toISOString().split("T")[0];
    res.render("booking.ejs", {
        services: svcRes.rows,
        technicians: techRes.rows,
        today,
        success: null,
    });
});

// Returns available time slots for a given date + technician
app.get("/api/available-slots", async (req, res) => {
    const { date, technician_id } = req.query;
    const allSlots = ["09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00"];
    if (!date) return res.json(allSlots);

    // "Any Available" (id=1) — show all slots, admin resolves conflicts
    if (!technician_id || technician_id === "1") return res.json(allSlots);

    const result = await db.query(
        "SELECT to_char(time_slot, 'HH24:MI') AS slot FROM bookings WHERE booking_date = $1 AND technician_id = $2 AND status != 'cancelled'",
        [date, technician_id]
    );
    const booked = result.rows.map(r => r.slot);
    res.json(allSlots.filter(s => !booked.includes(s)));
});

app.post("/booking", async (req, res) => {
    const { client_name, client_email, client_phone, service_id, technician_id, booking_date, time_slot, notes } = req.body;

    const [svcRes, techRes] = await Promise.all([
        db.query("SELECT * FROM services WHERE id = $1", [service_id]),
        db.query("SELECT * FROM technicians WHERE id = $1", [technician_id]),
    ]);
    const service = svcRes.rows[0];
    const tech = techRes.rows[0];

    await db.query(
        "INSERT INTO bookings (client_name, client_email, client_phone, service_id, technician_id, booking_date, time_slot, notes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)",
        [client_name, client_email, client_phone, service_id, technician_id, booking_date, time_slot, notes || null]
    );

    const dateStr = new Date(booking_date + "T12:00:00").toLocaleDateString("en-US", {
        weekday: "long", year: "numeric", month: "long", day: "numeric",
    });
    const [h] = time_slot.split(":");
    const hour = parseInt(h);
    const timeStr = `${hour > 12 ? hour - 12 : hour}:${time_slot.split(":")[1]} ${hour >= 12 ? "PM" : "AM"}`;

    // Send confirmation to client
    transporter.sendMail({
        from: process.env.EMAIL_ADMIN,
        to: client_email,
        subject: "Booking Request Received – Fantastic Nails & Spa",
        html: `
            <h2 style="color:#4a2060">Thank you, ${client_name}!</h2>
            <p>We've received your booking request and will confirm it shortly.</p>
            <table style="border-collapse:collapse;width:100%;max-width:500px;font-family:sans-serif">
                <tr><td style="padding:8px;font-weight:bold;background:#f9f2ff">Service</td><td style="padding:8px">${service.name}</td></tr>
                <tr><td style="padding:8px;font-weight:bold">Technician</td><td style="padding:8px">${tech.name}</td></tr>
                <tr><td style="padding:8px;font-weight:bold;background:#f9f2ff">Date</td><td style="padding:8px">${dateStr}</td></tr>
                <tr><td style="padding:8px;font-weight:bold">Time</td><td style="padding:8px">${timeStr}</td></tr>
                <tr><td style="padding:8px;font-weight:bold;background:#f9f2ff">Price</td><td style="padding:8px">From $${service.price_from}</td></tr>
            </table>
            <p style="margin-top:16px">We'll send another email once your appointment is confirmed.</p>
            <p>Questions? Call us at <strong>(360) 736-4123</strong></p>
            <p style="color:#4a2060;font-style:italic">— Fantastic Nails & Spa</p>
        `,
    }).catch(err => console.error("Client email error:", err));

    // Notify admin
    transporter.sendMail({
        from: process.env.EMAIL_ADMIN,
        to: process.env.EMAIL_ADMIN,
        subject: `New Booking: ${client_name} – ${service.name}`,
        html: `
            <h2>New Booking Request</h2>
            <table style="border-collapse:collapse;width:100%;max-width:500px;font-family:sans-serif">
                <tr><td style="padding:8px;font-weight:bold;background:#f9f9f9">Client</td><td style="padding:8px">${client_name}</td></tr>
                <tr><td style="padding:8px;font-weight:bold">Email</td><td style="padding:8px">${client_email}</td></tr>
                <tr><td style="padding:8px;font-weight:bold;background:#f9f9f9">Phone</td><td style="padding:8px">${client_phone || "N/A"}</td></tr>
                <tr><td style="padding:8px;font-weight:bold">Service</td><td style="padding:8px">${service.name}</td></tr>
                <tr><td style="padding:8px;font-weight:bold;background:#f9f9f9">Technician</td><td style="padding:8px">${tech.name}</td></tr>
                <tr><td style="padding:8px;font-weight:bold">Date</td><td style="padding:8px">${dateStr}</td></tr>
                <tr><td style="padding:8px;font-weight:bold;background:#f9f9f9">Time</td><td style="padding:8px">${timeStr}</td></tr>
                ${notes ? `<tr><td style="padding:8px;font-weight:bold">Notes</td><td style="padding:8px">${notes}</td></tr>` : ""}
            </table>
            <p><a href="${process.env.SITE_URL || "http://localhost:3000"}/admin">View in Admin Dashboard →</a></p>
        `,
    }).catch(err => console.error("Admin email error:", err));

    const [svcRes2, techRes2] = await Promise.all([
        db.query("SELECT * FROM services ORDER BY category, name"),
        db.query("SELECT * FROM technicians ORDER BY id"),
    ]);
    const today = new Date().toISOString().split("T")[0];
    res.render("booking.ejs", {
        services: svcRes2.rows,
        technicians: techRes2.rows,
        today,
        success: true,
    });
});

// ─── Admin Routes ─────────────────────────────────────────────

function requireAdmin(req, res, next) {
    if (req.isAuthenticated()) return next();
    res.redirect("/admin/login");
}

app.get("/admin/login", (req, res) => {
    if (req.isAuthenticated()) return res.redirect("/admin");
    res.render("admin/login.ejs", { error: req.query.error });
});

app.post("/admin/login",
    passport.authenticate("local", {
        successRedirect: "/admin",
        failureRedirect: "/admin/login?error=1",
    })
);

app.get("/admin/logout", (req, res) => {
    req.logout(() => res.redirect("/admin/login"));
});

app.get("/admin", requireAdmin, async (req, res) => {
    const filter = req.query.status || "all";

    const [bookingsResult, countsResult] = await Promise.all([
        db.query(`
            SELECT b.id, b.client_name, b.client_email, b.client_phone,
                   b.booking_date, to_char(b.time_slot, 'HH12:MI AM') AS time_display,
                   b.status, b.notes, b.created_at,
                   s.name AS service_name, s.price_from,
                   t.name AS technician_name
            FROM bookings b
            JOIN services s ON b.service_id = s.id
            JOIN technicians t ON b.technician_id = t.id
            ${filter !== "all" ? "WHERE b.status = $1" : ""}
            ORDER BY b.booking_date ASC, b.time_slot ASC
        `, filter !== "all" ? [filter] : []),
        db.query(`
            SELECT
                COUNT(*) FILTER (WHERE status = 'pending')                                    AS pending,
                COUNT(*) FILTER (WHERE status = 'confirmed')                                  AS confirmed,
                COUNT(*) FILTER (WHERE booking_date = CURRENT_DATE AND status != 'cancelled') AS today,
                COUNT(*)                                                                       AS total
            FROM bookings
        `),
    ]);

    res.render("admin/dashboard.ejs", {
        bookings: bookingsResult.rows,
        counts: countsResult.rows[0],
        filter,
    });
});

app.get("/admin/change-password", requireAdmin, (req, res) => {
    res.render("admin/change-password.ejs", { username: req.user.username, error: null, success: false });
});

app.post("/admin/change-password", requireAdmin, async (req, res) => {
    const { current_password, new_password, confirm_password } = req.body;

    const result = await db.query("SELECT * FROM admins WHERE id = $1", [req.user.id]);
    const admin = result.rows[0];

    const validCurrent = await bcrypt.compare(current_password, admin.password_hash);
    if (!validCurrent) {
        return res.render("admin/change-password.ejs", { username: admin.username, error: "Current password is incorrect.", success: false });
    }
    if (new_password !== confirm_password) {
        return res.render("admin/change-password.ejs", { username: admin.username, error: "New passwords do not match.", success: false });
    }
    if (new_password.length < 8) {
        return res.render("admin/change-password.ejs", { username: admin.username, error: "Password must be at least 8 characters.", success: false });
    }

    const hash = await bcrypt.hash(new_password, 10);
    await db.query("UPDATE admins SET password_hash = $1 WHERE id = $2", [hash, admin.id]);
    res.render("admin/change-password.ejs", { username: admin.username, error: null, success: true });
});

app.post("/admin/booking/:id/status", requireAdmin, async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const redirectFilter = req.query.status || "all";

    // Send confirmation email when admin approves
    if (status === "confirmed") {
        const result = await db.query(`
            SELECT b.*, s.name AS service_name, t.name AS technician_name,
                   to_char(b.time_slot, 'HH12:MI AM') AS time_display
            FROM bookings b
            JOIN services s ON b.service_id = s.id
            JOIN technicians t ON b.technician_id = t.id
            WHERE b.id = $1
        `, [id]);
        const booking = result.rows[0];
        if (booking) {
            const dateStr = new Date(booking.booking_date).toLocaleDateString("en-US", {
                weekday: "long", year: "numeric", month: "long", day: "numeric", timeZone: "UTC",
            });
            transporter.sendMail({
                from: process.env.EMAIL_ADMIN,
                to: booking.client_email,
                subject: "Appointment Confirmed – Fantastic Nails & Spa",
                html: `
                    <h2 style="color:#4a2060">Your appointment is confirmed! 💅</h2>
                    <p>Hi ${booking.client_name}, we look forward to seeing you!</p>
                    <table style="border-collapse:collapse;width:100%;max-width:500px;font-family:sans-serif">
                        <tr><td style="padding:8px;font-weight:bold;background:#f9f2ff">Service</td><td style="padding:8px">${booking.service_name}</td></tr>
                        <tr><td style="padding:8px;font-weight:bold">Technician</td><td style="padding:8px">${booking.technician_name}</td></tr>
                        <tr><td style="padding:8px;font-weight:bold;background:#f9f2ff">Date</td><td style="padding:8px">${dateStr}</td></tr>
                        <tr><td style="padding:8px;font-weight:bold">Time</td><td style="padding:8px">${booking.time_display}</td></tr>
                    </table>
                    <p style="margin-top:16px">📍 507B Harrison Avenue, Centralia, WA</p>
                    <p>📞 (360) 736-4123</p>
                    <p style="color:#4a2060;font-style:italic">— Fantastic Nails & Spa</p>
                `,
            }).catch(err => console.error("Confirm email error:", err));
        }
    }

    await db.query("UPDATE bookings SET status = $1 WHERE id = $2", [status, id]);
    res.redirect(`/admin?status=${redirectFilter}`);
});

// ─── Passport ─────────────────────────────────────────────────

passport.use(new Strategy(async (username, password, cb) => {
    try {
        const result = await db.query("SELECT * FROM admins WHERE username = $1", [username]);
        if (result.rows.length === 0) return cb(null, false);
        const valid = await bcrypt.compare(password, result.rows[0].password_hash);
        return cb(null, valid ? result.rows[0] : false);
    } catch (err) {
        return cb(err);
    }
}));

passport.serializeUser((user, cb) => cb(null, user.id));
passport.deserializeUser(async (id, cb) => {
    try {
        const result = await db.query("SELECT * FROM admins WHERE id = $1", [id]);
        cb(null, result.rows[0] || false);
    } catch (err) {
        cb(err);
    }
});

app.listen(port, () => console.log(`Listening on port ${port}`));
