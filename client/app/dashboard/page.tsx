"use client";

import { useState, useEffect } from "react";
import axios from "axios";

export default function Home() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Get token from URL and store it in localStorage
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");
    if (token) {
      localStorage.setItem("access_token", `Bearer ${token}`);
    }
  }, []);

  const fetchPolicies = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      if (!token) return alert("Please authenticate first");

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_APP_URL}/api/conditional-access`,
        {
          headers: { Authorization: token },
        }
      );
      setData(response.data);
    } catch (error) {
      console.error("Error fetching policies:", error);
    } finally {
      setLoading(false);
    }
  };

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "policies.json";
    link.click();
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Microsoft Graph API - Conditional Access Policies</h1>
      <button onClick={fetchPolicies} disabled={loading}>
        {loading ? "Loading..." : "Fetch Policies"}
      </button>
      {data && (
        <div>
          <pre>{JSON.stringify(data, null, 2)}</pre>
          <button onClick={exportJSON}>Export to JSON</button>
        </div>
      )}
    </div>
  );
}
