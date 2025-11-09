document.addEventListener("DOMContentLoaded", () => {
  const loginSection = document.getElementById("loginSection");
  const dashboardSection = document.getElementById("dashboardSection");
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");
  const loginError = document.getElementById("loginError");
  const registerMsg = document.getElementById("registerMsg");
  const showRegister = document.getElementById("showRegister");
  const backToLogin = document.getElementById("backToLogin");
  const BASE_URL = "http://localhost:5000"; 
  const API_URL = `${BASE_URL}/campaigns`;
  showRegister.addEventListener("click", () => {
    loginForm.style.display = "none";
    registerForm.style.display = "block";
    loginError.style.display = "none";
  });
  loginForm.addEventListener("submit", async (e) => {e.preventDefault();
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const res = await fetch(`${BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });
    if (res.ok) {
      loginSection.style.display = "none";
      dashboardSection.style.display = "block";
      fetchCampaigns();
    } else {
      loginError.style.display = "block";
    }
  });
  registerForm.addEventListener("submit", async (e) => {e.preventDefault();
    const username = document.getElementById("newUsername").value;
    const password = document.getElementById("newPassword").value;
    const res = await fetch(`${BASE_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });
    if (res.ok) {
      loginSection.style.display = "none";
      dashboardSection.style.display = "block";
      fetchCampaigns();
    } else {
      const data = await res.json();
      registerMsg.textContent = data.message || "Error creating account";
      registerMsg.style.color = "red";
    }
  });

  const campaignForm = document.getElementById("campaignForm");
  const campaignList = document.getElementById("campaignList");
  const totalCount = document.getElementById("totalCount");
  const activeCount = document.getElementById("activeCount");
  const pausedCount = document.getElementById("pausedCount");
  const completedCount = document.getElementById("completedCount");
  const searchInput = document.getElementById("searchInput");
  const statusFilter = document.getElementById("statusFilter");
  let campaigns = [];
  async function fetchCampaigns() {
    const res = await fetch(API_URL);
    campaigns = await res.json();
    showCampaigns();
  }
  function showCampaigns() {
    const search = searchInput.value.toLowerCase();
    const filter = statusFilter.value;
    const filtered = campaigns.filter(c =>
      (c.campaignName.toLowerCase().includes(search) ||
       c.clientName.toLowerCase().includes(search)) &&
      (filter === "" || c.status === filter)
    );
    campaignList.innerHTML = filtered.map(c => `
      <tr>
        <td>${c.campaignName}</td>
        <td>${c.clientName}</td>
        <td>${c.startDate}</td>
        <td>
          <select onchange="updateStatus('${c._id}', this.value)">
            <option ${c.status === 'Active' ? 'selected' : ''}>Active</option>
            <option ${c.status === 'Paused' ? 'selected' : ''}>Paused</option>
            <option ${c.status === 'Completed' ? 'selected' : ''}>Completed</option>
          </select>
        </td>
        <td><button onclick="deleteCampaign('${c._id}')">Delete</button></td>
      </tr>
      `).join("");
    totalCount.textContent = filtered.length;
    activeCount.textContent = filtered.filter(c => c.status === "Active").length;
    pausedCount.textContent = filtered.filter(c => c.status === "Paused").length;
    completedCount.textContent = filtered.filter(c => c.status === "Completed").length;
  }
  campaignForm.addEventListener("submit", async (e) => {e.preventDefault();
    const newCampaign = {
      campaignName: document.getElementById("campaignName").value,
      clientName: document.getElementById("clientName").value,
      startDate: document.getElementById("startDate").value,
      status: document.getElementById("status").value
    };
    await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newCampaign)
    });

    campaignForm.reset();
    fetchCampaigns();
  });
  window.updateStatus = async (id, status) => {
    await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });
    fetchCampaigns();
  };
  window.deleteCampaign = async (id) => {
    await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    fetchCampaigns();
  };
  searchInput.addEventListener("input", showCampaigns);
  statusFilter.addEventListener("change", showCampaigns);
});
