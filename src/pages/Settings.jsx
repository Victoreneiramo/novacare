import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { 
  MdDashboard, 
  MdPerson, 
  MdHistory, 
  MdSettings,
  MdEmail,
  MdPhone,
  MdLock,
  MdWarning,
  MdCheckCircle
} from "react-icons/md";
import { FaUserCircle } from "react-icons/fa";

// @ts-ignore - Ignore image import errors
import logoImg from "../assets/images/logo.png";
// @ts-ignore - Ignore image import errors
import backgroundLeaf from "../assets/images/backroundleaf.png";

function Settings() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeMenuItem, setActiveMenuItem] = useState("Settings");
  const [showSaveNotification, setShowSaveNotification] = useState(false);

  // User settings state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
      setEmail(user.email || "");
    }

    // Load saved emergency contact info from localStorage
    try {
      const savedEmergency = localStorage.getItem("novacare_emergency_contact");
      if (savedEmergency) {
        const parsed = JSON.parse(savedEmergency);
        setPhone(parsed.phone || "");
        setEmergencyContact(parsed.emergencyContact || "");
        setEmergencyPhone(parsed.emergencyPhone || "");
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    }
  }, [user]);

  const handleLogout = () => {
    if (logout) {
      logout();
    }
    navigate("/login");
  };

  const handleSidebarClick = (item) => {
    setActiveMenuItem(item);
    switch (item) {
      case "Dashboard":
        navigate("/dashboard");
        break;
      case "Health Profile":
      case "Medical History":
        navigate("/medical-history");
        break;
      case "Settings":
        // Stay on settings
        break;
      default:
        break;
    }
  };

  const handleSaveSettings = () => {
    try {
      // Save emergency contact info to localStorage
      localStorage.setItem("novacare_emergency_contact", JSON.stringify({
        phone,
        emergencyContact,
        emergencyPhone,
      }));

      // Show success notification
      setShowSaveNotification(true);
      setTimeout(() => setShowSaveNotification(false), 3000);
    } catch (error) {
      console.error("Error saving settings:", error);
      alert("Failed to save settings. Please try again.");
    }
  };

  const handleDeleteAccount = () => {
    const confirmed = window.confirm(
      "⚠️ WARNING: This will permanently delete your account and all associated data.\n\nThis includes:\n• Your health profile\n• All medical history\n• Test results\n• Personal information\n\nThis action CANNOT be undone.\n\nAre you absolutely sure you want to delete your account?"
    );
    
    if (confirmed) {
      const doubleConfirm = window.confirm(
        "This is your final warning. Click OK to permanently delete your account."
      );
      
      if (doubleConfirm) {
        try {
          // Get user ID
          const userId = user?.id;
          
          if (userId) {
            // Delete health profiles
            const profiles = JSON.parse(localStorage.getItem("novacare_health_profiles") || "[]");
            const updatedProfiles = profiles.filter((p) => p.userId !== userId);
            localStorage.setItem("novacare_health_profiles", JSON.stringify(updatedProfiles));
            
            // Delete test results
            const testResults = JSON.parse(localStorage.getItem("novacare_test_results") || "[]");
            const updatedTests = testResults.filter((t) => t.userId !== userId);
            localStorage.setItem("novacare_test_results", JSON.stringify(updatedTests));
            
            // Delete emergency contact
            localStorage.removeItem("novacare_emergency_contact");
            
            // Delete user from users list
            const users = JSON.parse(localStorage.getItem("novacare_users") || "[]");
            const updatedUsers = users.filter((u) => u.id !== userId);
            localStorage.setItem("novacare_users", JSON.stringify(updatedUsers));
          }
          
          // Logout and redirect
          alert("Your account has been permanently deleted.");
          if (logout) {
            logout();
          }
          navigate("/");
        } catch (error) {
          console.error("Error deleting account:", error);
          alert("An error occurred while deleting your account. Please try again.");
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-sky-50 relative overflow-hidden">
      {/* Background Leaf */}
      <div 
        className="absolute top-0 right-0 w-[600px] h-[600px] opacity-20 -z-0"
        style={{
          backgroundImage: `url(${backgroundLeaf})`,
          backgroundSize: 'contain',
          backgroundPosition: 'top right',
          backgroundRepeat: 'no-repeat',
          transform: 'translate(15%, -15%)'
        }}
      />

      {/* Success Notification */}
      {showSaveNotification && (
        <div className="fixed top-6 right-6 bg-emerald-600 text-white px-6 py-4 rounded-xl shadow-lg z-50 flex items-center gap-3 animate-slide-in">
          <MdCheckCircle className="text-2xl" />
          <span className="font-medium">Settings saved successfully!</span>
        </div>
      )}

      <div className="flex">
        {/* Left Sidebar */}
        <aside className="w-64 bg-white shadow-md p-6 min-h-screen relative z-10 flex flex-col">
          {/* Logo Section */}
          <div className="flex items-center gap-3 font-bold text-xl mb-8 pb-6 border-b border-gray-200">
            <img src={logoImg} alt="NovaCare Logo" className="h-10 w-10 object-contain" />
            <span className="text-slate-900">NOVA CARE</span>
          </div>

          {/* Navigation */}
          <nav className="space-y-2 flex-1">
            {[
              { label: "Dashboard", icon: <MdDashboard className="text-xl" /> },
              { label: "Health Profile", icon: <MdPerson className="text-xl" /> },
              { label: "Medical History", icon: <MdHistory className="text-xl" /> },
              { label: "Settings", icon: <MdSettings className="text-xl" /> },
            ].map(item => (
              <SidebarItem 
                key={item.label} 
                active={activeMenuItem === item.label} 
                label={item.label}
                icon={item.icon}
                onClick={() => handleSidebarClick(item.label)} 
              />
            ))}
          </nav>

          {/* Logout Button */}
          <div className="mt-auto pt-8">
            <button
              onClick={handleLogout}
              className="w-full bg-slate-900 text-white px-4 py-3 rounded-xl hover:bg-slate-800 transition-colors text-sm font-medium"
            >
              Logout
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8 relative z-10">
          <div className="max-w-5xl mx-auto">
            {/* Page Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
                Account Settings <MdSettings className="text-slate-700" />
              </h1>
              <p className="text-slate-600 mt-2">
                Manage your personal information and account preferences
              </p>
            </div>

            {/* Account Settings Content */}
            <div className="bg-white rounded-2xl shadow-md p-8">
              <div className="space-y-6">
                {/* Personal Information */}
                <div>
                  <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <FaUserCircle className="text-emerald-600" />
                    Personal Information
                  </h2>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        First Name
                      </label>
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        placeholder="Enter first name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Last Name
                      </label>
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        placeholder="Enter last name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                        <MdEmail className="text-gray-500" />
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        placeholder="your.email@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                        <MdPhone className="text-gray-500" />
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        placeholder="+234 XXX XXX XXXX"
                      />
                    </div>
                  </div>
                </div>

                {/* Emergency Contact */}
                <div className="border-t border-gray-200 pt-6">
                  <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <MdPerson className="text-red-600" />
                    Emergency Contact
                  </h2>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Contact Name
                      </label>
                      <input
                        type="text"
                        value={emergencyContact}
                        onChange={(e) => setEmergencyContact(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        placeholder="Enter contact name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                        <MdPhone className="text-gray-500" />
                        Contact Phone
                      </label>
                      <input
                        type="tel"
                        value={emergencyPhone}
                        onChange={(e) => setEmergencyPhone(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        placeholder="+234 XXX XXX XXXX"
                      />
                    </div>
                  </div>
                </div>

                {/* Password */}
                <div className="border-t border-gray-200 pt-6">
                  <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <MdLock className="text-blue-600" />
                    Password
                  </h2>
                  <button className="px-6 py-3 border-2 border-emerald-600 text-emerald-700 rounded-xl hover:bg-emerald-50 transition-colors font-medium flex items-center gap-2">
                    <MdLock />
                    Change Password
                  </button>
                </div>

                {/* Delete Account - Danger Zone */}
                <div className="border-t border-gray-200 pt-6">
                  <h2 className="text-xl font-semibold text-slate-900 mb-4 text-red-600 flex items-center gap-2">
                    <MdWarning className="text-red-600" />
                    Danger Zone
                  </h2>
                  <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <MdWarning className="text-5xl text-red-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900 mb-2">Delete Account</h3>
                        <p className="text-sm text-slate-600 mb-4">
                          Once you delete your account, there is no going back. This will permanently remove:
                        </p>
                        <ul className="text-sm text-slate-600 mb-4 list-disc list-inside space-y-1">
                          <li>Your health profile and medical history</li>
                          <li>All test results and diagnoses</li>
                          <li>Personal information and emergency contacts</li>
                          <li>All saved data and preferences</li>
                        </ul>
                        <button
                          onClick={handleDeleteAccount}
                          className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium flex items-center gap-2"
                        >
                          <MdWarning />
                          Delete My Account
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="border-t border-gray-200 mt-8 pt-6 flex justify-end gap-4">
                <button
                  onClick={() => navigate("/dashboard")}
                  className="px-6 py-3 border-2 border-gray-300 text-slate-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveSettings}
                  className="px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-medium flex items-center gap-2"
                >
                  <MdCheckCircle />
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      <style>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

// --- Components ---
const SidebarItem = ({ label, icon, active, onClick }) => (
  <div 
    onClick={onClick} 
    className={`px-4 py-3 rounded-xl cursor-pointer transition-colors flex items-center gap-3 ${
      active 
        ? "bg-emerald-100 text-emerald-800 font-medium" 
        : "text-slate-600 hover:bg-slate-100"
    }`}
  >
    {icon && <span>{icon}</span>}
    <span>{label}</span>
  </div>
);

export default Settings;
