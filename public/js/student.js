// ==============================
// STUDENT PAGE PROTECTION
// ==============================

const activeUser =
    JSON.parse(localStorage.getItem("activeUser"));

if (!activeUser || activeUser.role !== "student") {

    window.location.href = "login.html";

}



// ==============================
// LOAD STUDENT PROFILE
// ==============================

const studentName =
    document.getElementById("studentName");

const studentEmail =
    document.getElementById("studentEmail");

if (activeUser) {

    if (studentName) {
        studentName.textContent = activeUser.name;
    }

    if (studentEmail) {
        studentEmail.textContent = activeUser.email;
    }

}




const menuButton = document.getElementById("menuButton");
const closeButton = document.getElementById("closeButton");
const sidebar = document.getElementById("sidebar");
const sidebarOverlay = document.getElementById("sidebarOverlay");


// Open sidebar

menuButton.addEventListener("click", () => {

    sidebar.classList.add("open");

    sidebarOverlay.classList.add("show");

});


// Close sidebar

closeButton.addEventListener("click", () => {

    sidebar.classList.remove("open");

    sidebarOverlay.classList.remove("show");

});


// Close when clicking outside

sidebarOverlay.addEventListener("click", () => {

    sidebar.classList.remove("open");

    sidebarOverlay.classList.remove("show");

});


// Close sidebar after selecting a navigation item on mobile

const navItems = document.querySelectorAll(".sidebar .nav-item");

navItems.forEach((item) => {

    item.addEventListener("click", () => {

        if (window.innerWidth <= 900) {

            sidebar.classList.remove("open");

            sidebarOverlay.classList.remove("show");

        }

    });

});






// =========================
// REPORT ISSUE FORM
// =========================

const issueForm = document.getElementById("issueForm");

if (issueForm) {

    issueForm.addEventListener("submit", async (event) => {

        event.preventDefault();

        const formData = new FormData(issueForm);

        const issueData = {

            title: formData.get("issueTitle"),

            category: formData.get("category"),

            location: formData.get("location"),

            description: formData.get("description"),

            priority: formData.get("priority").charAt(0).toUpperCase() + formData.get("priority").slice(1),

            student: JSON.parse(localStorage.getItem("activeUser")).email

        };


        try {

            const response = await fetch("/api/issues", {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(issueData)

            });


            const data = await response.json();


            if (!response.ok) {

                alert(data.message);

                return;

            }


            alert(
                "Issue submitted successfully!\n\n" +
                "Issue ID: " + data.issue.id
            );


            issueForm.reset();


        } catch (error) {

            console.error(error);

            alert(
                "Unable to submit issue. Please try again."
            );

        }

    });

}

// =========================
// PHOTO UPLOAD
// =========================

const cameraInput = document.getElementById("cameraInput");
const galleryInput = document.getElementById("galleryInput");
const imagePreview = document.getElementById("imagePreview");

let selectedImage = null;


// Show selected image

function showImage(file) {

    if (!file) {
        return;
    }

    // Make sure it is an image

    if (!file.type.startsWith("image/")) {

        alert("Please select an image file.");

        return;
    }


    selectedImage = file;


    const imageURL = URL.createObjectURL(file);


    imagePreview.innerHTML = `

        <img src="${imageURL}" alt="Selected issue photo">

        <button
            type="button"
            class="remove-photo"
            id="removePhoto"
            aria-label="Remove photo"
        >

            <span class="material-symbols-outlined">
                close
            </span>

        </button>

    `;


    // Remove photo

    const removePhoto = document.getElementById("removePhoto");

    removePhoto.addEventListener("click", () => {

        selectedImage = null;

        cameraInput.value = "";
        galleryInput.value = "";

        imagePreview.innerHTML = `

            <span class="material-symbols-outlined">
                image
            </span>

            <p>No photo selected</p>

        `;

    });

}


// Camera

if (cameraInput) {

    cameraInput.addEventListener("change", () => {

        showImage(cameraInput.files[0]);

    });

}


// Gallery

if (galleryInput) {

    galleryInput.addEventListener("change", () => {

        showImage(galleryInput.files[0]);

    });

}







// =========================
// MY ISSUES FILTER
// =========================

const statusFilter = document.getElementById("statusFilter");
const issuesList = document.getElementById("issuesList");
const noIssues = document.getElementById("noIssues");

function applyMyIssuesFilter() {

    if (!statusFilter || !issuesList) {
        return;
    }

    const selectedStatus = statusFilter.value;

    const issueCards =
        document.querySelectorAll(".issue-card");

    let visibleIssues = 0;

    issueCards.forEach((card) => {

        const cardStatus = card.dataset.status;

        if (
            selectedStatus === "all" ||
            cardStatus === selectedStatus
        ) {

            card.style.display = "block";

            visibleIssues++;

        } else {

            card.style.display = "none";

        }

    });


    if (noIssues) {

        if (visibleIssues === 0) {

            noIssues.classList.add("show");

        } else {

            noIssues.classList.remove("show");

        }

    }

}


// Dropdown

if (statusFilter) {

    statusFilter.addEventListener("change", () => {

        applyMyIssuesFilter();

    });

}





// =========================
// LOAD MY ISSUES FROM API
// =========================

async function loadMyIssuesFromAPI() {

    try {

        const response = await fetch("/api/issues");

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Failed to load issues");
        }

        const loggedInUser =
            JSON.parse(localStorage.getItem("loggedInStudent"));

        if (!loggedInUser) {
            return;
        }

        const studentEmail =
            loggedInUser.email;

        const myIssues = data.issues.filter(
            issue => issue.student === studentEmail
        );


        // Update total issue count

        const studentIssueCount =
            document.getElementById("studentIssueCount");

        if (studentIssueCount) {

            studentIssueCount.textContent =
                `${myIssues.length} Issues`;

        }


        if (myIssues.length === 0) {

            issuesList.innerHTML = "";

            if (noIssues) {
                noIssues.style.display = "block";
            }

            return;
        }


        if (noIssues) {
            noIssues.style.display = "none";
        }


        issuesList.innerHTML = myIssues.map(issue => {

            const statusClass = issue.status
                .toLowerCase()
                .replace(/\s+/g, "-");


            return `
                <article
                    class="issue-card"
                    data-status="${statusClass}"
                >

                    <div class="issue-card-top">

                        <div class="issue-title-area">

                            <div class="issue-main-icon ${statusClass}">

                                <span class="material-symbols-outlined">
                                    report_problem
                                </span>

                            </div>


                            <div>

                                <h2>${issue.title}</h2>

                                <p>
                                    Issue ID: #${issue.id}
                                </p>

                            </div>

                        </div>


                        <span class="issue-status ${statusClass}">
                            ${issue.status}
                        </span>

                    </div>


                    <div class="issue-details">

                        <span>
                            <span class="material-symbols-outlined">
                                category
                            </span>
                            ${issue.category}
                        </span>


                        <span>
                            <span class="material-symbols-outlined">
                                location_on
                            </span>
                            ${issue.location}
                        </span>


                        <span>
                            <span class="material-symbols-outlined">
                                calendar_month
                            </span>
                            ${issue.date}
                        </span>

                    </div>


                    <p class="issue-description">
                        ${issue.description}
                    </p>


                    <div class="issue-footer">

                        <span>
                            Priority:
                            <strong>${issue.priority}</strong>
                        </span>

                    </div>

                </article>
            `;

        }).join("");


        // Re-apply selected filter after loading issues
        applyMyIssuesFilter();


    } catch (error) {

        console.error("Error loading my issues:", error);

    }

}




// =========================
// STUDENT DASHBOARD STATS
// =========================

async function loadStudentDashboardStats() {

    try {

        const response = await fetch("/api/issues");

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message || "Failed to load issues"
            );
        }

        const loggedInUser =
            JSON.parse(localStorage.getItem("loggedInStudent"));

        if (!loggedInUser) {
            return;
        }

        const studentEmail =
            loggedInUser.email;

        // Only this student's issues
        const myIssues = data.issues.filter(
            issue => issue.student === studentEmail
        );


        // Total
        const totalCount =
            document.getElementById(
                "studentTotalIssuesCount"
            );

        if (totalCount) {
            totalCount.textContent =
                myIssues.length;
        }


        // Pending
        const pendingCount =
            document.getElementById(
                "studentPendingIssuesCount"
            );

        if (pendingCount) {

            pendingCount.textContent =
                myIssues.filter(
                    issue =>
                        String(issue.status)
                            .trim()
                            .toLowerCase() === "pending"
                ).length;

        }


        // In Progress
        const inProgressCount =
            document.getElementById(
                "studentInProgressIssuesCount"
            );

        if (inProgressCount) {

            inProgressCount.textContent =
                myIssues.filter(
                    issue =>
                        String(issue.status)
                            .trim()
                            .toLowerCase() === "in progress"
                ).length;

        }


        // Resolved
        const resolvedCount =
            document.getElementById(
                "studentResolvedIssuesCount"
            );

        if (resolvedCount) {

            resolvedCount.textContent =
                myIssues.filter(
                    issue =>
                        String(issue.status)
                            .trim()
                            .toLowerCase() === "resolved"
                ).length;

        }

    } catch (error) {

        console.error(
            "Error loading student dashboard stats:",
            error
        );

    }

}
loadStudentDashboardStats()



// Load real issues when My Issues page opens

if (issuesList) {
    loadMyIssuesFromAPI();
}






// =========================
// LOAD RECENT ISSUES
// =========================

const recentIssuesList =
    document.getElementById("recentIssuesList");


async function loadRecentIssues() {

    if (!recentIssuesList) {
        return;
    }

    try {

        const response = await fetch("/api/issues");

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message || "Failed to load issues"
            );
        }


        const loggedInUser =
            JSON.parse(localStorage.getItem("loggedInStudent"));

        if (!loggedInUser) {
            return;
        }

        const studentEmail =
            loggedInUser.email;


        // Get only this student's issues

        const myIssues = data.issues.filter(
            issue => issue.student === studentEmail
        );


        // Show latest 3 issues

        const recentIssues =
            myIssues.slice(0, 3);


        // No issues

        if (recentIssues.length === 0) {

            recentIssuesList.innerHTML = `

                <div class="no-recent-issues">

                    <span class="material-symbols-outlined">
                        assignment
                    </span>

                    <h3>No issues reported yet</h3>

                    <p>
                        You have not reported any campus issues.
                    </p>

                </div>

            `;

            return;
        }


        // Display issues

        recentIssuesList.innerHTML =
            recentIssues.map(issue => {

                const statusClass =
                    issue.status
                        .toLowerCase()
                        .replace(/\s+/g, "-");


                return `

                    <div class="issue-row">

                        <div class="issue-info">

                            <div class="issue-status-icon ${statusClass}">

                                <span class="material-symbols-outlined">
                                    report_problem
                                </span>

                            </div>


                            <div>

                                <h3>
                                    ${issue.title}
                                </h3>

                                <p>
                                    ${issue.location}
                                </p>

                            </div>

                        </div>


                        <span class="status ${statusClass}-status">
                            ${issue.status}
                        </span>

                    </div>

                `;

            }).join("");


    } catch (error) {

        console.error(
            "Error loading recent issues:",
            error
        );

    }

}
loadRecentIssues();


// =========================
// AUTO REFRESH DASHBOARD
// =========================

setInterval(() => {

    loadStudentDashboardStats();
    loadRecentIssues();

    if (issuesList) {
        loadMyIssuesFromAPI();
    }

}, 5000);




// =========================
// STUDENT LOGOUT
// =========================

const studentLogout =
    document.getElementById("studentLogout");

if (studentLogout) {

    studentLogout.addEventListener("click", async () => {

        try {

            const response = await fetch("/api/logout", {

                method: "POST"

            });

            const data = await response.json();

            if (!response.ok) {

                alert(data.message || "Logout failed");

                return;

            }


            // Remove frontend session

            localStorage.removeItem("loggedInStudent");
            localStorage.removeItem("activeUser");


            // Go to login

            window.location.href = "login.html";

        } catch (error) {

            console.error("Student logout error:", error);

            alert("Unable to logout. Please try again.");

        }

    });

}