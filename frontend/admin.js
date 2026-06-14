const API = "/api";

function goHome() {
  window.location.href = "/";
}

function checkAdminAccess() {
  const token = localStorage.getItem("token");
  const isAdmin = localStorage.getItem("isAdmin");

  if (!token || isAdmin !== "true") {
    alert("Access denied. Admin only.");
    window.location.href = "/";
    return false;
  }

  return true;
}

async function verifyAdminWithServer() {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API}/me`, {
    headers: {
      "Authorization": token
    }
  });

  const data = await res.json();

  if (!data || data.is_admin !== 1) {
    alert("Access denied. Admin only.");
    window.location.href = "/";
    return false;
  }

  return true;
}

async function loadAdminUsers() {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API}/admin/users`, {
    headers: {
      "Authorization": token
    }
  });

  const data = await res.json();

  const box = document.getElementById("adminUsers");

  box.innerHTML = "";

  if (!data || data.length === 0) {
    box.innerHTML = "<p>No users found.</p>";
    return;
  }

  data.forEach(user => {
    box.innerHTML += `
      <div class="match-item">
        <h4>${user.username}</h4>

        <p>Points: ${user.points}</p>
        <p>Status: ${user.is_active === 1 ? "Active" : "Disabled"}</p>
        <p>Admin: ${user.is_admin === 1 ? "Yes" : "No"}</p>

        <input
          type="number"
          id="points-${user.id}"
          placeholder="Add/remove points e.g. 500 or -500"
        >

        <button onclick="updateUserPoints(${user.id})">
          Update Points
        </button>

        <button onclick="toggleUser(${user.id})">
          ${user.is_active === 1 ? "Disable User" : "Activate User"}
        </button>

        <button onclick="deleteUser(${user.id})">
  Delete User
</button>
      </div>
    `;
  });
}
async function deleteUser(userId) {
  const token = localStorage.getItem("token");

  const confirmDelete = confirm(
    "Are you sure you want to delete this user permanently? This cannot be undone."
  );

  if (!confirmDelete) return;

  const res = await fetch(`${API}/admin/delete-user`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": token
    },
    body: JSON.stringify({
      userId
    })
  });

  const data = await res.json();

  alert(data.message);

  if (res.ok) {
    await loadAdminUsers();
  }
}


async function updateUserPoints(userId) {
  const token = localStorage.getItem("token");

  const input = document.getElementById(`points-${userId}`);
  const amount = Number(input.value);

  if (!amount) {
    alert("Enter points amount first.");
    return;
  }

  const confirmUpdate = confirm(
    `Are you sure you want to update this user by ${amount} points?`
  );

  if (!confirmUpdate) return;

  const res = await fetch(`${API}/admin/user-points`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": token
    },
    body: JSON.stringify({
      userId,
      amount
    })
  });

  const data = await res.json();

  alert(data.message);

  loadAdminUsers();
}

async function toggleUser(userId) {
  const token = localStorage.getItem("token");

  const confirmToggle = confirm("Are you sure you want to change this user's status?");

  if (!confirmToggle) return;

  const res = await fetch(`${API}/admin/toggle-user`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": token
    },
    body: JSON.stringify({
      userId
    })
  });

  const data = await res.json();

  alert(data.message);

  loadAdminUsers();
}

async function loadAdminMatches() {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API}/matches`);
  const data = await res.json();

  const box = document.getElementById("adminMatches");

  box.innerHTML = "";

  if (!data || data.length === 0) {
    box.innerHTML = "<p>No matches found.</p>";
    return;
  }

  data.forEach(match => {
    box.innerHTML += `
      <div class="match-item">

        <h3>${match.team_a} vs ${match.team_b}</h3>

        <p>
          Stage: ${match.stage}
          ${match.group_name ? " - " + match.group_name : ""}
        </p>

        <p>Time: ${match.match_time}</p>
        <p>Status: ${match.status}</p>
        <p>Result: ${match.result || "Not set"}</p>

        <button onclick="setResult(${match.id}, '${match.team_a}')">
          ${match.team_a} Won
        </button>

        <button onclick="setResult(${match.id}, '${match.team_b}')">
          ${match.team_b} Won
        </button>

        <button onclick="setResult(${match.id}, 'DRAW')">
          Draw
        </button>

      </div>
    `;
  });
}

async function setResult(matchId, result) {
  const token = localStorage.getItem("token");

  const confirmResult = confirm(
    `Set result as ${result}? This will settle all predictions for this match.`
  );

  if (!confirmResult) return;

  const res = await fetch(`${API}/admin/result`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": token
    },
    body: JSON.stringify({
      matchId,
      result
    })
  });

  const data = await res.json();

  alert(data.message);

  loadAdminMatches();
}

async function addNewMatch() {
  const token = localStorage.getItem("token");

  const teamA = document.getElementById("newTeamA").value.trim();
  const teamB = document.getElementById("newTeamB").value.trim();
  const stage = document.getElementById("newStage").value.trim();
  const venue = document.getElementById("newVenue").value.trim();
  const matchTime = document.getElementById("newMatchTime").value;

  if (!teamA || !teamB || !matchTime) {
    alert("Please enter Team A, Team B and match time.");
    return;
  }

  const confirmAdd = confirm(
    `Add match: ${teamA} vs ${teamB}?`
  );

  if (!confirmAdd) return;

  const res = await fetch(`${API}/admin/add-match`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": token
    },
    body: JSON.stringify({
      teamA,
      teamB,
      stage,
      venue,
      matchTime
    })
  });

  const data = await res.json();

  alert(data.message);

  if (res.ok) {
    document.getElementById("newTeamA").value = "";
    document.getElementById("newTeamB").value = "";
    document.getElementById("newStage").value = "";
    document.getElementById("newVenue").value = "";
    document.getElementById("newMatchTime").value = "";

    loadAdminMatches();
  }
}

async function initAdmin() {
  if (!checkAdminAccess()) return;

  const ok = await verifyAdminWithServer();

  if (!ok) return;

  loadAdminUsers();
  loadAdminMatches();
}

initAdmin();

// Export all users as JSON for AJA League import
async function exportUsersForAJA() {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API}/admin/users`, {
    headers: { "Authorization": token }
  });

  const users = await res.json();

  // Format for AJA import (exclude admin accounts)
  const exportData = users
    .filter(u => u.is_admin !== 1)
    .map(u => ({
      username: u.username,
      fullName: u.full_name || u.username,
      country: "UAE",
      points: u.points
    }));

  const json = JSON.stringify(exportData, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "yugo-users-export.json";
  a.click();
  URL.revokeObjectURL(url);
}
