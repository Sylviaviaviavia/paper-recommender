import React, { useState, useEffect } from "react";

const App = () => {
  const [filters, setFilters] = useState({});
  const [feedData, setFeedData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const filterCategories = [
    "Category 1", "Category 2", "Category 3", "Category 4",
    "Category 5", "Category 6", "Category 7", "Category 8"
  ];

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          // api call
          "https://bsky.social/xrpc/app.bsky.feed.getFeed?feed=at://did:plc:uaadt6f5bbda6cycbmatcm3z/app.bsky.feed.generator/preprintdigest", 
          {
            headers: {
              // auth
              Authorization: `Bearer eyJ0eXAiOiJhdCtqd3QiLCJhbGciOiJFUzI1NksifQ.eyJzY29wZSI6ImNvbS5hdHByb3RvLmFjY2VzcyIsInN1YiI6ImRpZDpwbGM6bmxja3c1bm03dHpvaHNremJyZWhicW5kIiwiaWF0IjoxNzM4NzE2ODU3LCJleHAiOjE3Mzg3MjQwNTcsImF1ZCI6ImRpZDp3ZWI6cGlvcHBpbm8udXMtd2VzdC5ob3N0LmJza3kubmV0d29yayJ9.Q8m8aqrBjetss7556MLSa7fDLWomglDHWlNXvuTK6ITeJOP4Fba5kxyFVWLi-gUeKHGTPjeIBQIfufoyUarMyA`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch feed data");
        }

        const data = await response.json();
        setFeedData(data.feed || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFeed();
  }, []);

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1 style={{ textAlign: "center", fontSize: "24px", marginBottom: "20px" }}>Paper Recommender</h1>

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

      {/* Paper Feed Section */}
      <div className="container">
        <h2 style={{ fontSize: "20px", marginBottom: "10px" }}>Preprint Digest Feed</h2>

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
                className="paper-card"
                style={{
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  padding: "15px",
                  marginBottom: "15px",
                  backgroundColor: "#fff",
                  boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.1)",
                }}
              >
                {/* Author Section */}
                <div
                  className="author-info"
                  style={{ display: "flex", alignItems: "center", marginBottom: "10px" }}
                >
                  <img
                    src={post.author.avatar}
                    alt="Avatar"
                    className="avatar"
                    style={{
                      width: "40px", // Smaller avatar size
                      height: "40px",
                      borderRadius: "50%",
                      marginRight: "10px",
                    }}
                  />
                  <div>
                    <h3 style={{ fontSize: "16px", margin: "0", fontWeight: "bold" }}>
                      {post.author.displayName}
                    </h3>
                    <p style={{ fontSize: "12px", margin: "0", color: "#555" }}>@{post.author.handle}</p>
                  </div>
                </div>

                {/* Post Text */}
                <p style={{ fontSize: "14px", marginBottom: "10px" }}>{record.text}</p>

                {/* Paper Link (if available) */}
                {embed?.uri && (
                  <p>
                    <a
                      href={embed.uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontSize: "14px", color: "#1a73e8", textDecoration: "none" }}
                    >
                      📄 Read Paper: {embed.title || "View Paper"}
                    </a>
                  </p>
                )}

                {/* Engagement Metrics */}
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
      </div>
    </div>
  );
};

export default App;

{/* npm run dev */}




