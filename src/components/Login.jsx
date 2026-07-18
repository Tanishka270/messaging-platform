import React from "react";
import { GoogleOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/Authcontext";

const Login = () => {
  const navigate = useNavigate();
  const { loginWithGoogle: signInWithGoogle, startGuestSession } = useAuth();


  //This function logs the user in using Google, and after a successful login, redirects them to the /chats page.
  const loginWithGoogle = async () => {
    await signInWithGoogle();
    navigate("/chats");
  };

  const handleGuestLogin = async () => {
  const guestUser = {
    uid: "guest_" + Date.now(), // unique id for guest
    displayName: "Guest User",
    isGuest: true,
  };

  // Save the guest user and update AuthContext before navigation.
  await startGuestSession(guestUser);

  // Redirect to chats page
  navigate("/chats");
};

  return (
    <div id="login-page">
      <div id="login-card">
        <h2>Welcome to Chattr 👋</h2>

        <div
          className="login-button google"
          onClick={loginWithGoogle}
        >
          <GoogleOutlined /> Sign in with Google
        </div>

        <br /><br />
        <button
          className="guest-btn"
          onClick={handleGuestLogin}
        >
          👤 Continue as Guest
        </button>
            </div>
    </div>
  );
};

export default Login;
