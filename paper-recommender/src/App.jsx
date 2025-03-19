import React, { useState, useEffect } from "react";

const App = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authToken, setAuthToken] = useState("");
  const [feedData, setFeedData] = useState([]);
  const [filters, setFilters] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openPostId, setOpenPostId] = useState(null);
  const [FeedList, setFeedList] = useState([]);
  const [userLikes, setUserLikes] = useState({});
  const displayedRoots = new Set();

  const filterCategories = [
    "Category 1", "Category 2", "Category 3", "Category 4",
    "Category 5", "Category 6", "Category 7", "Category 8"
  ];

  useEffect(() => {
    const savedLikes = JSON.parse(localStorage.getItem("userLikes")) || {};
    setUserLikes(savedLikes);
  }, []);

  useEffect(() => {
    localStorage.setItem("userLikes", JSON.stringify(userLikes));
  }, [userLikes]);

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

  const handleLogout = () => {
    setAuthToken("");
    setFeedData([]);
  };

  const fetchFeed = async (token) => {
    setLoading(true);
    setError(null);
  
    try {
      const response = await fetch("https://bsky.social/xrpc/app.bsky.feed.getFeed?feed=at://did:plc:uaadt6f5bbda6cycbmatcm3z/app.bsky.feed.generator/preprintdigest", {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      if (!response.ok) throw new Error("Failed to fetch feed.");
  
      const data = await response.json();
  
      // Load stored likes from localStorage
      const savedLikes = JSON.parse(localStorage.getItem("userLikes")) || {};
  
      // Merge stored likes with new posts without overwriting
      const newLikes = { ...savedLikes };
      data.feed.forEach((item) => {
        const postId = item.post.uri;
        if (!(postId in newLikes)) {
          newLikes[postId] = false; // Default to not liked if not stored
        }
      });
  
      // Save updated likes back to localStorage
      localStorage.setItem("userLikes", JSON.stringify(newLikes));
  
      setUserLikes(newLikes); // Keep likes persistent
      setFeedList(data.feed.map((item) => item.post.uri));
      const replyList = data.feed.flatMap((item) => 
        [item.reply?.root?.uri, item.reply?.parent?.uri].filter(Boolean)
      );
      setFeedData(data.feed.filter((item) => !replyList.includes(item.post.uri)) || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  

  const toggleComments = (postId) => {
    setOpenPostId(openPostId === postId ? null : postId);
  };

  const toggleUserLike = (postId) => {
    setUserLikes((prevLikes) => {
      const updatedLikes = {
        ...prevLikes,
        [postId]: !prevLikes[postId],
      };
  
      localStorage.setItem("userLikes", JSON.stringify(updatedLikes)); // Immediately save updated likes
      return updatedLikes;
    });
  };  

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1 style={{ textAlign: "center" }}>Paper Recommender</h1>

      {!authToken ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: "40px" }}>
          {/* Login Form */}
          <div style={{
            display: "flex", flexDirection: "column", gap: "10px", maxWidth: "400px", 
            width: "100%", padding: "20px", borderRadius: "10px", backgroundColor: "#ffffff",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)"
          }}>
            <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ padding: "10px", fontSize: "16px", borderRadius: "5px", border: "1px solid #ccc" }}
              />
              <input
                type="password"
                placeholder="Enter your App Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ padding: "10px", fontSize: "16px", borderRadius: "5px", border: "1px solid #ccc" }}
              />
              <button type="submit" style={{ 
                padding: "10px", fontSize: "16px", background: "#1e90ff", color: "white", 
                border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "bold"
              }}>
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>
            {error && <p style={{ color: "red", fontSize: "14px", marginTop: "10px", textAlign: "center" }}>{error}</p>}
          </div>

          {/* Instruction Box */}
          <div style={{
            marginTop: "40px", maxWidth: "450px", width: "100%", padding: "25px", 
            borderRadius: "10px", backgroundColor: "#f8f9fa", border: "1px solid #ddd",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)"
          }}>
            {/* <h3 style={{ fontSize: "18px", marginBottom: "10px", textAlign: "center" }}>How to Get an App Password</h3> */}
            <p style={{ textAlign: "center", fontSize: "14px" }}>
              <strong>Note:</strong> Use an <b>App Password</b> instead of your main password.
            </p>
            <ol style={{ paddingLeft: "20px", fontSize: "14px" }}>
              <li>Log in to <a href="https://bsky.app" target="_blank" style={{ color: "#007bff", textDecoration: "none", fontWeight: "bold" }}>Bluesky</a>.</li>
              <li>Go to <a href="https://bsky.app/settings/app-passwords" target="_blank" style={{ color: "#007bff", textDecoration: "none", fontWeight: "bold" }}>App Passwords</a> settings.</li>
              <li>Click <strong>"Add app password"</strong> and follow the instructions.</li>
              <li>Copy the generated password and enter it above.</li>
            </ol>
            <p style={{ fontSize: "14px", textAlign: "center", fontWeight: "bold", color: "#dc3545" }}>
              ⚠️ You won't be able to see the password again, so save it safely!
            </p>
          </div>
        </div>
      ) : (
        <>
          <button onClick={handleLogout} style={{
            padding: "10px", fontSize: "14px", background: "crimson", color: "white", border: "none", borderRadius: "5px", cursor: "pointer",
            position: "absolute", top: "60px", right: "20px"
          }}>
            Logout
          </button>

          {/* Filters Section */}
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
              const reply = item?.reply;
              const root = reply?.root;
              const parent = reply?.parent;
              const shouldShowRoot = root && !displayedRoots.has(root.uri);
              if (shouldShowRoot) {
                displayedRoots.add(root.uri);
              }
              const isUserLiked = userLikes[post.uri] || false;

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
                    position: "relative"
                  }}
                >
                  {/* User Like Button */}
                  <button 
                    onClick={() => toggleUserLike(post.uri)}
                    style={{
                      padding: "5px",
                      background: "none",
                      color: isUserLiked ? "red" : "#ccc",
                      border: "none",
                      fontSize: "20px",
                      cursor: "pointer",
                      position: "absolute",
                      top: "10px",
                      right: "10px",
                      transition: "color 0.3s ease"
                    }}
                  >
                    {isUserLiked ? "❤️" : "🤍"}
                  </button>
                  {/* Thread (Toggled) */}
                  {root && (shouldShowRoot && (FeedList && FeedList.includes(root.uri)) || (openPostId === post.uri)) && (
                    <div style={{ marginTop: '20px' }}>
                      <p className="note">Thread Root</p>
                      <div key={index} style={{ marginBottom: '15px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                          <img
                            src={root.author.avatar}
                            alt="Avatar"
                            style={{ width: '40px', height: '40px', borderRadius: '50%', marginRight: '10px' }}
                          />
                          <div>
                            <h3 style={{ fontSize: '16px', margin: '0', fontWeight: 'bold' }}>{root.author.displayName}</h3>
                            <p style={{ fontSize: '12px', margin: '0', color: '#555' }}>@{root.author.handle}</p>
                          </div>
                        </div>
                        <p style={{ fontSize: '14px', marginBottom: '10px' }}>{root.record.text}</p>
                        {root.record.embed?.external && (
                          <p>
                            <a
                              href={root.embed.external.uri}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ fontSize: '14px', color: '#1a73e8', textDecoration: 'none' }}
                            >
                              📄 Read Paper: {root.embed.external.title || 'View Paper'}
                            </a>
                          </p>
                        )}
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#666' }}>
                          <p>👍 {root.likeCount || 0} Likes</p>
                        </div>
                      </div>
                      {root.uri == parent.uri && (
                        <hr />
                      )}
                  </div>
                  )}
                  {parent && root.uri != parent.uri && ((FeedList && FeedList.includes(root.uri) || FeedList.includes(parent.uri) || (openPostId === post.uri))) && (
                    <div style={{ marginTop: '20px' }}>
                      <hr />
                      <p className="note">---Full Thread Not Shown---</p>
                      <hr />
                      <p className="note">Thread parent</p>
                      <div key={index} style={{ marginBottom: '15px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                          <img
                            src={parent.author.avatar}
                            alt="Avatar"
                            style={{ width: '40px', height: '40px', borderRadius: '50%', marginRight: '10px' }}
                          />
                          <div>
                            <h3 style={{ fontSize: '16px', margin: '0', fontWeight: 'bold' }}>{parent.author.displayName}</h3>
                            <p style={{ fontSize: '12px', margin: '0', color: '#555' }}>@{parent.author.handle}</p>
                          </div>
                        </div>
                        <p style={{ fontSize: '14px', marginBottom: '10px' }}>{parent.record.text}</p>
                        {parent.record.embed?.external && (
                          <p>
                            <a
                              href={parent.embed.external.uri}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ fontSize: '14px', color: '#1a73e8', textDecoration: 'none' }}
                            >
                              📄 Read Paper: {parent.embed.external.title || 'View Paper'}
                            </a>
                          </p>
                        )}
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#666' }}>
                          <p>👍 {parent.likeCount || 0} Likes</p>
                        </div>
                      </div>
                      <hr />
                  </div>
                  )}
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
                    { root &&
                      (<p onClick={() => toggleComments(post.uri)} style={{ cursor: 'pointer' }}>💬 Thread</p>)
                    }
                    <p>📅 {new Date(record.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              );
            })
          ) : (
            <p>No feed data available.</p>
          )}
        </>
      )}
    </div>
  );
};

export default App;











