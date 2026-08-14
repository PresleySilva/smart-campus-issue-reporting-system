const express = require("express");
const path = require("path");
const session = require("express-session")
const db = require("./db");

const app = express();

const PORT = 3000;


// =========================
// MIDDLEWARE
// =========================

app.use(express.json());

app.use(express.urlencoded({
    extended: true
}));


// =========================
// SESSION AUTHENTICATION
// =========================

app.use(session({
    secret: "smart-campus-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        maxAge: 1000 * 60 * 60
    }
}));


// =========================
// LOGIN API
// =========================

app.post("/api/login", async (req, res) => {

    try {

        const { email, password } = req.body;

        // Check required fields
        if (!email || !password) {

            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });

        }

        // Find user
        const [rows] = await db.query(`
            SELECT id, name, email, role
            FROM users
            WHERE email = ? AND password = ?
        `, [email, password]);

        // Invalid login
        if (rows.length === 0) {

            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });

        }

        // Successful login
        const user = rows[0];


        // Store logged-in user in server session
        req.session.user = user;


        res.json({
            success: true,
            message: "Login successful",
            user: user
        });

    } catch (error) {

        console.error("Login error:", error);

        res.status(500).json({
            success: false,
            message: "Login failed"
        });

    }

});


// =========================
// AUTHENTICATION MIDDLEWARE
// =========================

function requireLogin(req, res, next) {

    if (!req.session.user) {

        return res.status(401).json({
            success: false,
            message: "Please login first"
        });

    }

    next();
}


// =========================
// STUDENT AUTHORIZATION
// =========================

function requireStudent(req, res, next) {

    if (!req.session.user) {

        return res.status(401).json({
            success: false,
            message: "Please login first"
        });

    }

    if (req.session.user.role !== "student") {

        return res.status(403).json({
            success: false,
            message: "Student access required"
        });

    }

    next();
}


// =========================
// TEACHER AUTHORIZATION
// =========================

function requireTeacher(req, res, next) {

    if (!req.session.user) {

        return res.status(401).json({
            success: false,
            message: "Please login first"
        });

    }

    if (req.session.user.role !== "teacher") {

        return res.status(403).json({
            success: false,
            message: "Teacher access required"
        });

    }

    next();
}


// =========================
// LOGOUT API
// =========================

app.post("/api/logout", requireLogin, (req, res) => {

    req.session.destroy((error) => {

        if (error) {

            console.error("Logout error:", error);

            return res.status(500).json({
                success: false,
                message: "Logout failed"
            });

        }

        res.json({
            success: true,
            message: "Logout successful"
        });

    });

});



// ==============================
// PROTECTED FRONTEND PAGES
// ==============================

// STUDENT DASHBOARD
app.get("/student/dashboard.html", (req, res) => {

    if (!req.session.user) {
        return res.redirect("/student/login.html");
    }

    if (req.session.user.role !== "student") {
        return res.redirect("/teacher/dashboard.html");
    }

    res.sendFile(
        path.join(__dirname, "public", "student", "dashboard.html")
    );

});


// STUDENT MY ISSUES
app.get("/student/my-issues.html", (req, res) => {

    if (!req.session.user) {
        return res.redirect("/student/login.html");
    }

    if (req.session.user.role !== "student") {
        return res.redirect("/teacher/dashboard.html");
    }

    res.sendFile(
        path.join(__dirname, "public", "student", "my-issues.html")
    );

});


// STUDENT REPORT ISSUE
app.get("/student/report.html", (req, res) => {

    if (!req.session.user) {
        return res.redirect("/student/login.html");
    }

    if (req.session.user.role !== "student") {
        return res.redirect("/teacher/dashboard.html");
    }

    res.sendFile(
        path.join(__dirname, "public", "student", "report.html")
    );

});


// TEACHER DASHBOARD
app.get("/teacher/dashboard.html", (req, res) => {

    if (!req.session.user) {
        return res.redirect("/teacher/login.html");
    }

    if (req.session.user.role !== "teacher") {
        return res.redirect("/student/dashboard.html");
    }

    res.sendFile(
        path.join(__dirname, "public", "teacher", "dashboard.html")
    );

});



// =========================
// SERVE FRONTEND
// =========================

app.use(express.static(
    path.join(__dirname, "public")
));


// =========================
// TEST API
// =========================

app.get("/api/test", (req, res) => {

    res.json({
        success: true,
        message: "Smart Campus API is working!"
    });

});


// =========================
// GET ALL ISSUES
// =========================

app.get("/api/issues", requireLogin, async (req, res) => {

    try {

        let rows;

        if (req.session.user.role === "student") {

            [rows] = await db.query(`
                SELECT
                    id,
                    title,
                    category,
                    location,
                    description,
                    priority,
                    status,
                    student,
                    DATE_FORMAT(date, '%d %b %Y') AS date
                FROM issues
                WHERE student = ?
                ORDER BY date DESC
            `, [req.session.user.email]);

        } else {

            [rows] = await db.query(`
                SELECT
                    id,
                    title,
                    category,
                    location,
                    description,
                    priority,
                    status,
                    student,
                    DATE_FORMAT(date, '%d %b %Y') AS date
                FROM issues
                ORDER BY date DESC
            `);

}

        res.json({
            success: true,
            count: rows.length,
            issues: rows
        });

    } catch (error) {

        console.error("Error fetching issues:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch issues"
        });

    }

});


// =========================
// GET ONE ISSUE
// =========================

app.get("/api/issues/:id", async (req, res) => {

    try {

        const issueId = req.params.id;

        const [rows] = await db.query(`
            SELECT
                id,
                title,
                category,
                location,
                description,
                priority,
                status,
                student,
                DATE_FORMAT(date, '%d %b %Y') AS date
            FROM issues
            WHERE id = ?
        `, [issueId]);


        if (rows.length === 0) {

            return res.status(404).json({
                success: false,
                message: "Issue not found"
            });

        }


        res.json({
            success: true,
            issue: rows[0]
        });

    } catch (error) {

        console.error("Error fetching issue:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch issue"
        });

    }

});


// =========================
// CREATE NEW ISSUE
// =========================

app.post("/api/issues", requireStudent, async (req, res) => {

    try {

        const {
            title,
            category,
            location,
            description,
            priority
        } = req.body;

        const student = req.session.user.email;

        // =========================
        // CHECK REQUIRED FIELDS
        // =========================

        if (
            !title ||
            !category ||
            !location ||
            !description ||
            !priority ||
            !student
        ) {

            return res.status(400).json({
                success: false,
                message: "Please provide all required fields"
            });

        }


        // =========================
        // GENERATE NEW ISSUE ID
        // =========================

        const [lastIssue] = await db.query(`
            SELECT id
            FROM issues
            ORDER BY CAST(SUBSTRING(id, 4) AS UNSIGNED) DESC
            LIMIT 1
        `);


        let newNumber = 1001;


        if (lastIssue.length > 0) {

            const lastNumber =
                parseInt(
                    lastIssue[0].id.substring(3)
                );

            newNumber = lastNumber + 1;

        }


        const newId = `SC-${newNumber}`;


        // =========================
        // CURRENT DATE
        // =========================

        const currentDate =
            new Date()
                .toISOString()
                .split("T")[0];


        // =========================
        // INSERT INTO MYSQL
        // =========================

        await db.query(`
            INSERT INTO issues
            (
                id,
                title,
                category,
                location,
                description,
                priority,
                status,
                student,
                date
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            newId,
            title,
            category,
            location,
            description,
            priority,
            "Pending",
            student,
            currentDate
        ]);


        // =========================
        // RESPONSE
        // =========================

        const newIssue = {

            id: newId,

            title: title,

            category: category,

            location: location,

            description: description,

            priority: priority,

            status: "Pending",

            student: student,

            date: new Date()
                .toLocaleDateString(
                    "en-GB",
                    {
                        day: "2-digit",
                        month: "short",
                        year: "numeric"
                    }
                )

        };


        res.status(201).json({

            success: true,

            message: "Issue reported successfully",

            issue: newIssue

        });

    } catch (error) {

        console.error("Error creating issue:", error);

        res.status(500).json({

            success: false,

            message: "Failed to create issue"

        });

    }

});


// =========================
// UPDATE ISSUE STATUS
// =========================

app.patch("/api/issues/:id", requireTeacher, async (req, res) => {

    try {

        const issueId = req.params.id;

        const {
            status
        } = req.body;


        // =========================
        // CHECK STATUS
        // =========================

        if (!status) {

            return res.status(400).json({

                success: false,

                message: "Status is required"

            });

        }


        // =========================
        // VALID STATUS VALUES
        // =========================

        const allowedStatuses = [
            "Pending",
            "In Progress",
            "Resolved"
        ];


        if (!allowedStatuses.includes(status)) {

            return res.status(400).json({

                success: false,

                message: "Invalid status"

            });

        }


        // =========================
        // UPDATE MYSQL
        // =========================

        const [result] = await db.query(`
            UPDATE issues
            SET status = ?
            WHERE id = ?
        `, [
            status,
            issueId
        ]);


        // =========================
        // ISSUE NOT FOUND
        // =========================

        if (result.affectedRows === 0) {

            return res.status(404).json({

                success: false,

                message: "Issue not found"

            });

        }


        // =========================
        // GET UPDATED ISSUE
        // =========================

        const [rows] = await db.query(`
            SELECT
                id,
                title,
                category,
                location,
                description,
                priority,
                status,
                student,
                DATE_FORMAT(date, '%d %b %Y') AS date
            FROM issues
            WHERE id = ?
        `, [issueId]);


        res.json({

            success: true,

            message: "Issue status updated",

            issue: rows[0]

        });

    } catch (error) {

        console.error(
            "Error updating issue status:",
            error
        );

        res.status(500).json({

            success: false,

            message: "Failed to update issue status"

        });

    }

});


// =========================
// HOME ROUTE
// =========================

app.get("/", (req, res) => {

    res.sendFile(
        path.join(
            __dirname,
            "public",
            "index.html"
        )
    );

});


// =========================
// SERVER
// =========================

app.listen(
    PORT,
    "0.0.0.0",
    () => {

        console.log(
            `Smart Campus server running on port ${PORT}`
        );

    }
);