import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/Authcontext";
import { db } from "./firebase";
import { doc, setDoc } from "firebase/firestore";
import "./Profile.css";
import { useNavigate } from "react-router-dom";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "./firebase";
import ComingSoonModal from "./ComingSoonModal";




const Profile = ({ profileUser, onBack }) => {
  const { user } = useAuth();
  const viewUser = profileUser || user;

  const [username, setUsername] = useState("");
  const [pronouns, setPronouns] = useState("she/her");
  const [status, setStatus] = useState("Available to chat 💬");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState("👩‍💻");
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
 const [error, setError] = useState("");
 const [showGuestOverlay, setShowGuestOverlay] = useState(false); 
 const [comingSoon, setComingSoon] = useState(null);



  useEffect(() => {
    if (user) {
      setUsername(viewUser?.username || "");
      setPronouns(user.pronouns || "she/her");
      setStatus(user.status || "Available to chat 💬");
      setBio(user.bio || "");
      setAvatar(user.avatar || "👩‍💻");
    }
  }, [viewUser]);


  {/* // 🚫 Guest restriction */}
if (user?.isGuest && !profileUser) {
  return (
    <div className="profile-guest-overlay">
      <div className="profile-guest-card">
        <h2>Login required</h2>
        <p>Login to create and view your profile ✨</p>

        <button
          className="google-btn"
          onClick={() => signInWithPopup(auth, googleProvider)}
        >
          Continue with Google
        </button>

        <button
          className="cancel-btn"
          onClick={() => {
            if (onBack) onBack();     // 👈 chat page
            else navigate("/chats");
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

  const saveProfile = async () => {
    if (!username.trim()) {
  setError("Please enter a username to complete your profile");
  return;
}setError("");

    try {
      setSaving(true);

  await setDoc(
  doc(db, "users", user.uid),
  {
    username,
    pronouns,
    status,
    bio,
    avatar,
    profileCompleted: true,
    uid: user.uid,
    email: user.email || "",
    name: user.displayName || "",
    updatedAt: new Date(),
  },
  { merge: true }   
);
  window.location.href = "/chats";
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const isReadOnly = !!profileUser;

  
  return (

<>


   <div className={`profile-page ${profileUser ? "readonly" : ""}`}>
      <div className="profile-card">

        {/* HEADER */}
        <div className="profile-header-gradient">
         <button
  className="profile-back"
  onClick={() => {
    if (onBack) onBack();
    else navigate("/chats");
  }}
>
  ←
</button>

          <div className="profile-avatar">
            {avatar}
          </div>

          <h2 className="profile-username">
            @{username || "your username"}
          </h2>

          <p className="profile-realname">
             {viewUser?.displayName || viewUser?.name || ""}
          </p>
        </div>


        {/* BODY */}
        <div className="profile-body">

          {/* USERNAME */}
          <div className="profile-field">
            <label>Username</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
               disabled={isReadOnly}
              placeholder="pick a cool username"
            />
          </div>

          {/* AVATAR PICKER */}
          <div className="profile-field">
            <label>Choose your vibe</label>
            <div className="avatar-picker">
              {["👩‍💻",
  "🧑‍💻",
  "😎",
  "🤓",
  "🧐",
  "💀",
  "👻",
  "🐱",
  "🐼",
  "🦊"].map((item) => (
                <button
                  key={item}
                    disabled={isReadOnly}
                  className={`avatar-option ${
                    avatar === item ? "active" : ""
                  }`}
                  onClick={() => setAvatar(item)}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* PRONOUNS */}
          <div className="profile-field">
            <label>Pronouns</label>
            <select
              value={pronouns}
              onChange={(e) => setPronouns(e.target.value)}
                disabled={isReadOnly}
              className="profile-select"
            >
              <option>she/her</option>
              <option>he/him</option>
              <option>they/them</option>
              <option>prefer not to say</option>
            </select>
          </div>

          {/* STATUS */}
          <div className="profile-field">
            <label>Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
                disabled={isReadOnly}
              className="profile-select"
            >
              <option>Available to chat 💬</option>
              <option>Busy 😴</option>
              <option>Coding 💻</option>
              <option>In a meeting 📞</option>
              <option>Offline 🚫</option>
            </select>
          </div>

          {/* ABOUT */}
          <div className="profile-field">
            <label>About</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Write a couple of lines so people can know you better."
                disabled={isReadOnly}
              maxLength={120}
            />
            <div className="profile-char-count">
              {bio.length}/120
            </div>
          </div>

{error && (
  <div className="profile-error">
    {error}
  </div>
)}

          {!isReadOnly && (
            <section className="profile-placeholder-section" aria-label="Planned account features">
              <h3>Account & privacy</h3>
              <button type="button" onClick={() => setComingSoon({ feature: "Linked Devices", description: "Use your account across additional devices. Device linking is not implemented yet." })}>
                <span>Linked Devices</span><small>Coming Soon</small>
              </button>
              <button type="button" onClick={() => setComingSoon({ feature: "Chat Backup & Restore", description: "Save and recover your chat history. Backup and restore are not implemented yet." })}>
                <span>Chat Backup & Restore</span><small>Coming Soon</small>
              </button>
              <button type="button" onClick={() => setComingSoon({ feature: "End-to-End Encryption", description: "End-to-end encryption is not implemented in this project. This informational placeholder does not indicate that messages are encrypted." })}>
                <span>End-to-End Encryption</span><small>Information</small>
              </button>
            </section>
          )}

          {!isReadOnly && (
  <button
    className="profile-save-btn"
    onClick={saveProfile}
    disabled={saving}
  >
    {saving ? "Saving..." : "Save Changes"}
  </button>
)}

        </div>
      </div>
    </div>
    {comingSoon && (
      <ComingSoonModal
        feature={comingSoon.feature}
        description={comingSoon.description}
        onClose={() => setComingSoon(null)}
      />
    )}
    </>
  );
};

export default Profile;
