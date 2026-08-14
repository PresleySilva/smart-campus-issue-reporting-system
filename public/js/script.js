console.log("Smart Campus application loaded successfully.");

const passwordInput = document.getElementById("password");
const togglePassword = document.getElementById("togglePassword");

if (passwordInput && togglePassword) {

    togglePassword.addEventListener("click", () => {

        if (passwordInput.type === "password") {

            passwordInput.type = "text";

            togglePassword.innerHTML = `
                <span class="material-symbols-outlined">
                    visibility_off
                </span>
            `;

        } else {

            passwordInput.type = "password";

            togglePassword.innerHTML = `
                <span class="material-symbols-outlined">
                    visibility
                </span>
            `;
        }

    });
}


// console.log("Smart Campus application loaded successfully.");




// =========================
// STUDENT LOGIN
// =========================

const studentLoginForm =
    document.getElementById("studentLoginForm");

if (studentLoginForm) {

    studentLoginForm.addEventListener("submit", async (event) => {

        event.preventDefault();

        const email =
            document.getElementById("email").value.trim();

        const password =
            document.getElementById("password").value;


        try {

            const response = await fetch("/api/login", {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    email: email,
                    password: password
                })

            });


            const data = await response.json();


            // Login failed

            if (!response.ok) {

                alert(data.message || "Login failed");

                return;

            }


            // Check user role

            if (data.user.role !== "student") {

                alert("This login is only for students.");

                return;

            }


            // Login successful

            localStorage.removeItem("loggedInTeacher");

            localStorage.setItem(
                "loggedInStudent",
                JSON.stringify(data.user)
            );

            localStorage.setItem(
                "activeUser",
                JSON.stringify(data.user)
            );

            alert("Login successful!");

            window.location.href = "dashboard.html";

        } catch (error) {

            console.error("Login error:", error);

            alert(
                "Unable to connect to the server. Please try again."
            );

        }

    });

}




// =========================
// TEACHER LOGIN
// =========================

const teacherLoginForm =
    document.getElementById("teacherLoginForm");

if (teacherLoginForm) {

    teacherLoginForm.addEventListener("submit", async (event) => {

        event.preventDefault();

        const email =
            document.getElementById("email").value;

        const password =
            document.getElementById("password").value;


        try {

            const response = await fetch("/api/login", {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    email: email,
                    password: password
                })

            });


            const data = await response.json();


            // Login failed

            if (!response.ok) {

                alert(data.message || "Login failed");

                return;

            }


            // Check teacher role

            if (data.user.role !== "teacher") {

                alert("This login is only for teachers.");

                return;

            }


            // Login successful

            localStorage.removeItem("loggedInStudent");

            localStorage.setItem(
                "loggedInTeacher",
                JSON.stringify(data.user)
            );

            localStorage.setItem(
                "activeUser",
                JSON.stringify(data.user)
            );

            alert("Login successful!");

            window.location.href = "../teacher/dashboard.html";

        } catch (error) {

            console.error(
                "Teacher login error:",
                error
            );

            alert(
                "Unable to login. Please try again."
            );

        }

    });

}