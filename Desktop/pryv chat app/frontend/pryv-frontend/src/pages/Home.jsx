import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import RegisterForm from "../components/RegisterForm.jsx";
import OtpForm from "../components/OtpForm.jsx";
import { AuthContext } from "../context/AuthContext.jsx";

export default function Home() {
  const [userData, setUserData] = useState(null);
  const [otpError, setOtpError] = useState(null);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleVerified = (user, token) => {
    login(user, token);
    navigate("/chat");
  };

  return (
    <div className="min-h-screen w-full bg-gray-100 px-4 py-4 sm:px-6 sm:py-6">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 items-center justify-center">
        {!userData ? (
          <RegisterForm onOtpSent={setUserData} />
        ) : (
          <OtpForm
            userData={userData}
            onVerified={handleVerified}
            onError={setOtpError}
            onBack={() => {
              setUserData(null);
              setOtpError(null);
            }}
          />
        )}
      </div>
      {otpError && <p className="mt-4 text-center text-red-600">{otpError}</p>}
    </div>
  );
}
