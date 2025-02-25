import React, { useState } from "react";

const App = () => {
  const [email, setEmail] = useState(""); // User email
  const [password, setPassword] = useState(""); // User password
  const [authToken, setAuthToken] = useState(""); // Store BlueSky auth token
  const [feedData, setFeedData] = useState([]);
  const [filters, setFilters] = useState({}); // Store selected filters
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const filterCategories = [
    "Category 1", "Category 2", "Category 3", "Category 4",
    "Category 5", "Category 6", "Category 7", "Category 8"
  ];

  // 🔹 Login function
  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("https://bsky.social/xrpc/com.atproto.server.createSession", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: email, password }),
      });

      if (!response.ok) throw new Error("Login failed. Check your credentials.");

      const data = await response.json();
      setAuthToken(data.accessJwt);
      fetchFeed(data.accessJwt);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Fetch feed after login
  const fetchFeed = async (token) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("https://bsky.social/xrpc/app.bsky.feed.getAuthorFeed?actor=did:plc:6ysaocl4wbig54tsqox4a2f5", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to fetch feed.");

      const data = await response.json();
      setFeedData(data.feed || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1 style={{ textAlign: "center" }}>Paper Recommender</h1>

      {/* 🔹 Login Form (Only if user is not logged in) */}
      {!authToken ? (
        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "10px", maxWidth: "400px", margin: "auto" }}>
          <input
            type="email"
            placeholder="Email or Handle"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ padding: "10px", fontSize: "16px", borderRadius: "5px", border: "1px solid #ccc" }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ padding: "10px", fontSize: "16px", borderRadius: "5px", border: "1px solid #ccc" }}
          />
          <button type="submit" style={{ padding: "10px", fontSize: "16px", background: "#007bff", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>
            {loading ? "Logging in..." : "Login"}
          </button>
          {error && <p style={{ color: "red" }}>{error}</p>}
        </form>
      ) : (
        <>
          {/* 🔹 Filters (Only after login) */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px", marginBottom: "20px" }}>
            {filterCategories.map((category) => (
              <div key={category} style={{ display: "flex", flexDirection: "column" }}>
                <label style={{ fontSize: "14px", fontWeight: "bold", marginBottom: "5px" }}>{category}</label>
                <select
                  onChange={(e) => setFilters({ ...filters, [category.toLowerCase().replace(/ /g, "_")]: e.target.value })}
                  style={{
                    padding: "8px",
                    fontSize: "14px",
                    borderRadius: "5px",
                    border: "1px solid #ccc",
                  }}
                >
                  <option value="" disabled selected>Select an option</option>
                  <option value="Option 1">Option 1</option>
                  <option value="Option 2">Option 2</option>
                  <option value="Option 3">Option 3</option>
                </select>
              </div>
            ))}
          </div>

          {/* 🔹 Feed Section */}
          <h2>Preprint Digest Feed</h2>
          {loading ? (
            <p>Loading feed...</p>
          ) : error ? (
            <p>Error: {error}</p>
          ) : feedData.length > 0 ? (
            feedData.map((item, index) => {
              const post = item.post;
              const record = post.record;
              const embed = record.embed?.external;

              return (
                <div
                  key={index}
                  style={{
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    padding: "15px",
                    marginBottom: "15px",
                    backgroundColor: "#fff",
                    boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.1)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", marginBottom: "10px" }}>
                    <img
                      src={post.author.avatar}
                      alt="Avatar"
                      style={{ width: "40px", height: "40px", borderRadius: "50%", marginRight: "10px" }}
                    />
                    <div>
                      <h3 style={{ fontSize: "16px", margin: "0", fontWeight: "bold" }}>{post.author.displayName}</h3>
                      <p style={{ fontSize: "12px", margin: "0", color: "#555" }}>@{post.author.handle}</p>
                    </div>
                  </div>
                  <p style={{ fontSize: "14px", marginBottom: "10px" }}>{record.text}</p>
                  {embed?.uri && (
                    <p>
                      <a href={embed.uri} target="_blank" rel="noopener noreferrer" style={{ fontSize: "14px", color: "#1a73e8", textDecoration: "none" }}>
                        📄 Read Paper: {embed.title || "View Paper"}
                      </a>
                    </p>
                  )}
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#666" }}>
                    <p>👍 {post.likeCount || 0} Likes</p>
                    <p>💬 {post.replyCount || 0} Comments</p>
                    <p>📅 {new Date(record.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              );
            })
          ) : (
            <p>No feed data available.</p>
          )}
          <button onClick={() => setAuthToken("")} style={{ marginTop: "10px", padding: "10px", background: "red", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>
            Logout
          </button>
        </>
      )}
    </div>
  );
};

export default App;



{/* npm run dev */}




