// ==============================
// TEACHER PAGE PROTECTION
// ==============================

const activeUser =
    JSON.parse(localStorage.getItem("activeUser"));

if (!activeUser || activeUser.role !== "teacher") {

    window.location.href = "login.html";

}



// =========================
// SIDEBAR
// =========================

const teacherMenuButton =
    document.getElementById("teacherMenuButton");

const teacherCloseButton =
    document.getElementById("teacherCloseButton");

const teacherSidebar =
    document.getElementById("teacherSidebar");

const teacherSidebarOverlay =
    document.getElementById("teacherSidebarOverlay");


// Open sidebar

if (teacherMenuButton) {

    teacherMenuButton.addEventListener("click", () => {

        teacherSidebar.classList.add("open");

        teacherSidebarOverlay.classList.add("show");

    });

}


// Close sidebar

if (teacherCloseButton) {

    teacherCloseButton.addEventListener("click", () => {

        teacherSidebar.classList.remove("open");

        teacherSidebarOverlay.classList.remove("show");

    });

}


// Close when clicking outside

if (teacherSidebarOverlay) {

    teacherSidebarOverlay.addEventListener("click", () => {

        teacherSidebar.classList.remove("open");

        teacherSidebarOverlay.classList.remove("show");

    });

}


// Close after clicking navigation on mobile

const teacherNavItems =
    document.querySelectorAll(".teacher-sidebar .teacher-nav-item");

teacherNavItems.forEach((item) => {

    item.addEventListener("click", () => {

        // Change active sidebar item
        teacherNavItems.forEach((navItem) => {
            navItem.classList.remove("active");
        });

        item.classList.add("active");


        // Close sidebar on mobile
        if (window.innerWidth <= 900) {

            teacherSidebar.classList.remove("open");

            teacherSidebarOverlay.classList.remove("show");

        }

    });

});


// =========================
// ISSUE FILTER
// =========================

const teacherStatusFilter =
    document.getElementById("teacherStatusFilter");

const teacherNoIssues =
    document.getElementById("teacherNoIssues");


let currentTeacherFilter = "all";


function applyTeacherFilter() {

    const issueRows =
        document.querySelectorAll(".teacher-issue-row");

    let visibleIssues = 0;


    issueRows.forEach((row) => {

        const rowStatus =
            row.dataset.status;

        const rowPriority =
            row.dataset.priority;


        let shouldShow = false;


        // =============================
        // ALL ISSUES
        // =============================

        if (currentTeacherFilter === "all") {

            shouldShow = 
                rowStatus === "pending" ||
                rowStatus === "progress"

        }


        // =============================
        // REPORTED ISSUES
        // Pending + In Progress
        // =============================

        else if (currentTeacherFilter === "reported") {

            shouldShow =
                rowStatus === "pending" ||
                rowStatus === "progress";

        }


        // =============================
        // PENDING
        // =============================

        else if (currentTeacherFilter === "pending") {

            shouldShow =
                rowStatus === "pending";

        }


        // =============================
        // IN PROGRESS
        // =============================

        else if (currentTeacherFilter === "progress") {

            shouldShow =
                rowStatus === "progress";

        }


        // =============================
        // RESOLVED
        // =============================

        else if (currentTeacherFilter === "resolved") {

            shouldShow =
                rowStatus === "resolved";

        }


        // =============================
        // HIGH PRIORITY
        // =============================

        else if (currentTeacherFilter === "high") {

            shouldShow =
                rowPriority === "high" &&
                rowStatus !== "resolved";

        }


        // Show / hide

        if (shouldShow) {

            row.style.display = "flex";

            visibleIssues++;

        } else {

            row.style.display = "none";

        }

    });


    // No issues message

    if (teacherNoIssues) {

        if (visibleIssues === 0) {

            teacherNoIssues.classList.add("show");

        } else {

            teacherNoIssues.classList.remove("show");

        }

    }

}


// Dropdown

if (teacherStatusFilter) {

    teacherStatusFilter.addEventListener("change", () => {

        currentTeacherFilter =
            teacherStatusFilter.value;

        applyTeacherFilter();

    });

}





// =========================
// REPORTED ISSUES BUTTON
// =========================

const reportedIssuesButton =
    document.getElementById("reportedIssuesButton");

if (reportedIssuesButton) {

    reportedIssuesButton.addEventListener("click", async (event) => {

        event.preventDefault();

        try {

            const response =
                await fetch("/api/issues");

            const data =
                await response.json();

            if (data.issues.length === 0) {

                alert("No issues found.");
                return;

            }

            // Show active reported issues
            currentTeacherFilter = "reported";

            teacherStatusFilter.value = "all";

            applyTeacherFilter()

            document.getElementById("recentIssues")
                .scrollIntoView({
                    behavior: "smooth"
                });

        } catch (error) {

            console.error(
                "Error checking reported issues:",
                error
            );

        }

    });

}




// =========================
// RESOLVED ISSUES BUTTON
// =========================

const resolvedIssuesButton =
    document.getElementById("resolvedIssuesButton");

if (resolvedIssuesButton) {

    resolvedIssuesButton.addEventListener("click", async (event) => {

        event.preventDefault();

        try {

            const response =
                await fetch("/api/issues");

            const data =
                await response.json();

            const resolvedIssues =
                data.issues.filter(
                    issue =>
                        String(issue.status)
                            .trim()
                            .toLowerCase() === "resolved"
                );


            if (resolvedIssues.length === 0) {

                alert("No resolved issues found.");

                // Go back to Dashboard
                currentTeacherFilter = "all";

                teacherStatusFilter.value = "all";

                applyTeacherFilter();

                // Change active sidebar item to Dashboard
                teacherNavItems.forEach((item) => {
                    item.classList.remove("active");
                });

                const dashboardItem =
                    document.querySelector('.teacher-nav-item[href="dashboard.html"]');

                if (dashboardItem) {
                    dashboardItem.classList.add("active");
                }

                return;

            }


            // Show only resolved issues

            currentTeacherFilter = "resolved";

            teacherStatusFilter.value = "all";

            applyTeacherFilter();


            document.getElementById("recentIssues")
                .scrollIntoView({
                    behavior: "smooth"
                });

        } catch (error) {

            console.error(
                "Error checking resolved issues:",
                error
            );

        }

    });

}





// =========================
// PENDING ISSUES BUTTON
// =========================

const pendingIssuesButton =
    document.getElementById("pendingIssuesButton");

if (pendingIssuesButton) {

    pendingIssuesButton.addEventListener("click", async (event) => {

        event.preventDefault();

        try {

            const response =
                await fetch("/api/issues");

            const data =
                await response.json();

            const pendingIssues =
                data.issues.filter(
                    issue =>
                        String(issue.status)
                            .trim()
                            .toLowerCase() === "pending"
                );


            if(data.issues.length === 0){

                alert("No reported issues found");
                return;
            }    
            
            if (pendingIssues.length === 0) {

                alert("No pending issues found.");
                return;

            }

            // Show only pending issues
            currentTeacherFilter = "pending";

            teacherStatusFilter.value = "pending";

            applyTeacherFilter();

            document.getElementById("recentIssues")
                .scrollIntoView({
                    behavior: "smooth"
                });

        } catch (error) {

            console.error(
                "Error checking pending issues:",
                error
            );

        }

    });

}






// ========================
// PRIORITY BUTTON
// ========================

const priorityButton =
    document.getElementById("priorityButton");

if (priorityButton) {

    priorityButton.addEventListener("click", () => {

        currentTeacherFilter = "high";

        teacherStatusFilter.value = "all";

        applyTeacherFilter();

        document.getElementById("recentIssues")
            .scrollIntoView({
                behavior: "smooth"
            });

    });

}







// ==============================
// TEACHER DASHBOARD STATISTICS
// ==============================

async function loadTeacherStats() {

    try {

        const response = await fetch("/api/issues");

        const data = await response.json();

        // console.log("TEACHER API DATA:", data);

        const issues = data.issues;

        // console.log("ISSUES:", issues);

        // Total issues
        document.getElementById("totalIssuesCount").textContent =
            issues.length;

        // Pending
        const pendingCount = issues.filter(
            issue =>
                String(issue.status).trim().toLowerCase() === "pending"
        ).length;

        document.getElementById("pendingIssuesCount").textContent =
            pendingCount;

        // In Progress
        const inProgressCount = issues.filter(
            issue =>
                String(issue.status).trim().toLowerCase() === "in progress"
        ).length;

        document.getElementById("inProgressIssuesCount").textContent =
            inProgressCount;

        // Resolved
        const resolvedCount = issues.filter(
            issue =>
                String(issue.status).trim().toLowerCase() === "resolved"
        ).length;

        document.getElementById("resolvedIssuesCount").textContent =
            resolvedCount;

    } catch (error) {

        console.error("Error loading teacher statistics:", error);

    }
}

loadTeacherStats();









// ========================================
// LOAD ISSUES FROM API
// ========================================

const teacherIssuesList = document.getElementById("teacherIssuesList");


async function loadTeacherIssues() {

    try {

        const response = await fetch("/api/issues");

        const data = await response.json();

        const highPriorityCount = document.getElementById("highPriorityCount");

        if (highPriorityCount) {
            const count = data.issues.filter(issue =>
                String(issue.priority).trim().toLowerCase() === "high" &&
                String(issue.status).trim().toLowerCase() !== "resolved"
            ).length;

            highPriorityCount.textContent =
                `${count} High Priority Issues`;

            const highPriorityCard =
                document.getElementById("pendingIssues");

            const priorityButton =
                document.getElementById("priorityButton");


            if (count > 0) {

                highPriorityCard.classList.remove("no-high-priority");

                if (priorityButton) {
                    priorityButton.style.display = "flex";
                }

            } else {

                highPriorityCount.textContent =
                    "No High Priority Issues";

                highPriorityCard.classList.add("no-high-priority");

                if (priorityButton) {
                    priorityButton.style.display = "none";
                }

            }

        }

        // console.log("Teacher issues:", data);

        teacherIssuesList.innerHTML = "";

        data.issues.forEach((issue) => {

            let statusClass = "pending";
            let statusText = "Pending";

            if (issue.status === "In Progress") {
                statusClass = "progress";
                statusText = "In Progress";
            }

            if (issue.status === "Resolved") {
                statusClass = "resolved";
                statusText = "Resolved";
            }

            const issueRow = document.createElement("div");

            issueRow.className = "teacher-issue-row";

            issueRow.dataset.status = statusClass;
            issueRow.dataset.priority = String(issue.priority).trim().toLowerCase();



            issueRow.innerHTML = `
                <div class="teacher-issue-main">

                    <div class="teacher-issue-icon ${statusClass}">

                        <span class="material-symbols-outlined">
                            report_problem
                        </span>

                    </div>

                    <div>

                        <h3>
                            ${issue.title}
                        </h3>

                        <p>
                            ${issue.student} • ${issue.location}
                        </p>

                    </div>

                </div>


                <div class="teacher-issue-right">

                    <span class="teacher-status ${statusClass}">
                        ${statusText}
                    </span>

                    <span class="teacher-date">
                        ${issue.date}
                    </span>

                    <div class="teacher-status-control">

                        <label>Status:</label>

                        <select class="teacher-status-select">

                            <option value="Pending"
                                ${issue.status.trim().toLowerCase() === "pending" ? "selected" : ""}>
                                Pending
                            </option>

                            <option value="In Progress"
                                ${issue.status.trim().toLowerCase() === "in progress" ? "selected" : ""}>
                                In Progress
                            </option>

                            <option value="Resolved"
                                ${issue.status.trim().toLowerCase() === "resolved" ? "selected" : ""}>
                                Resolved
                            </option>

                        </select>

                    </div>

                </div>
            `;

            const statusSelect = issueRow.querySelector(".teacher-status-select");

            if (statusSelect) {

                statusSelect.addEventListener("change", async () => {

                    const newStatus = statusSelect.value;

                    try {

                        const response = await fetch(
                            `/api/issues/${issue.id}`,
                            {
                                method: "PATCH",

                                headers: {
                                    "Content-Type": "application/json"
                                },

                                body: JSON.stringify({
                                    status: newStatus
                                })
                            }
                        );

                        const data = await response.json();

                        if (!response.ok) {
                            alert(data.message || "Failed to update status");
                            return;
                        }

                        // Reload dashboard data
                        await loadTeacherIssues();
                        await loadTeacherStats();

                    } catch (error) {

                        console.error(
                            "Error updating issue status:",
                            error
                        );

                    }

                });

            }

            teacherIssuesList.appendChild(issueRow);

        });

        teacherNoIssues.style.display =
            data.issues.length === 0 ? "block" : "none";

        // Re-apply the current filter after refreshing issues

       applyTeacherFilter()

    } catch (error) {

        console.error("Error loading teacher issues:", error);

    }

}
loadTeacherIssues();


// =========================
// AUTO REFRESH TEACHER DASHBOARD
// =========================

setInterval(() => {

    loadTeacherIssues();
    loadTeacherStats();

}, 5000);



// =========================
// TEACHER PROFILE
// =========================

const teacherName = document.getElementById("teacherName");
const teacherEmail = document.getElementById("teacherEmail");

if (activeUser) {

    if (teacherName) {
        teacherName.textContent = activeUser.name;
    }

    if (teacherEmail) {
        teacherEmail.textContent = activeUser.email;
    }

}




// =========================
// TEACHER LOGOUT
// =========================

const teacherLogout =
    document.getElementById("teacherLogout");

if (teacherLogout) {

    teacherLogout.addEventListener("click", async () => {

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

            localStorage.removeItem("loggedInTeacher");
            localStorage.removeItem("activeUser");


            // Go to login

            window.location.href = "login.html";

        } catch (error) {

            console.error("Teacher logout error:", error);

            alert("Unable to logout. Please try again.");

        }

    });

}