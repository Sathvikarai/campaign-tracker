document.addEventListener("DOMContentLoaded", () => {

    const loginSection = document.getElementById("loginSection");
  const dashboardSection = document.getElementById("dashboardSection");
  const loginForm = document.getElementById("loginForm");
  const loginError = document.getElementById("loginError");

  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    if (username === "admin" && password === "1234") {
      loginSection.style.display = "none";
      dashboardSection.style.display = "block";
      fetchCampaigns(); 
    } else {
      loginError.style.display = "block";
    }
  });
  const API_URL = "http://localhost:5000/campaigns";

  const campaignForm = document.getElementById("campaignForm");
  const campaignList = document.getElementById("campaignList");
  const totalCount = document.getElementById("totalCount");
  const activeCount = document.getElementById("activeCount");
  const pausedCount = document.getElementById("pausedCount");
  const completedCount = document.getElementById("completedCount");
  const searchInput = document.getElementById("searchInput");
  const statusFilter = document.getElementById("statusFilter");
  
  let campaignsData = [];

  async function fetchCampaigns() {
    try {
      const res = await fetch(API_URL);
      campaignsData = await res.json();
      displayCampaigns();
    } catch (err) {
      console.error("Error fetching campaigns:", err);
    }
  }

  function displayCampaigns() {
    const searchTerm = searchInput.value.toLowerCase();
    const statusTerm = statusFilter.value;

    const filteredData = campaignsData.filter(c => {
      const matchesSearch = c.campaignName.toLowerCase().includes(searchTerm) || c.clientName.toLowerCase().includes(searchTerm);
      const matchesStatus = statusTerm === "" || c.status === statusTerm;
      return matchesSearch && matchesStatus;
    });

    campaignList.innerHTML = "";

    filteredData.forEach(c => {
      const row = document.createElement("tr");
      row.innerHTML = `
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
      `;
      campaignList.appendChild(row);
    });

    totalCount.textContent = filteredData.length;
    activeCount.textContent = filteredData.filter(c => c.status === "Active").length;
    pausedCount.textContent = filteredData.filter(c => c.status === "Paused").length;
    completedCount.textContent = filteredData.filter(c => c.status === "Completed").length;
  }

  campaignForm.addEventListener("submit", async e => {
    e.preventDefault();
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

  window.deleteCampaign = async id => {
    await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    fetchCampaigns();
  };

  searchInput.addEventListener("input", displayCampaigns);
  statusFilter.addEventListener("change", displayCampaigns);

  fetchCampaigns();
});
