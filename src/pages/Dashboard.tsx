import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { 
  MdDashboard, 
  MdPerson, 
  MdHistory, 
  MdSettings,
  MdFavorite,
  MdMonitorWeight,
  MdHealthAndSafety
} from "react-icons/md";
import { IoMdArrowForward } from "react-icons/io";
import { FaStethoscope, FaUserEdit, FaHandPaper } from "react-icons/fa";

// @ts-ignore - Ignore image import errors
import logoImg from "../assets/images/Logo.png";
// @ts-ignore - Ignore image import errors
import backgroundLeaf from "../assets/images/background.png";

// --- Type definitions ---
interface User {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  [key: string]: any;
}

interface HealthProfile {
  userId: string;
  height?: number;
  weight?: number;
  bloodPressure?: string;
  medicalHistory?: any[];
  symptoms?: any[];
  medications?: string[];
  profilePicture?: string;
  dob?: string;
  gender?: string;
  bloodGroup?: string;
  genotype?: string;
  age?: number;
  firstName?: string;
  lastName?: string;
  [key: string]: any;
}

interface SidebarItemProps {
  label: string;
  icon?: React.ReactNode;
  active: boolean;
  onClick: () => void;
}

interface TestResult {
  id: string;
  userId: string;
  testName: string;
  date: string;
  timestamp: number;
  riskScore: number;
  [key: string]: any;
}

function Dashboard() {
  // @ts-ignore - AuthContext typing issue, but we know the structure
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [healthProfile, setHealthProfile] = useState<HealthProfile | null>(null);
  const [activeMenuItem, setActiveMenuItem] = useState("Dashboard");

  useEffect(() => {
    const userId = (user as User | null | undefined)?.id;
    if (!userId) return;
    
    const profiles: HealthProfile[] = JSON.parse(
      localStorage.getItem("novacare_health_profiles") || "[]"
    );
    const userProfile = profiles.find(p => p.userId === userId) || null;
    setHealthProfile(userProfile);
  }, [user]);

  const handleLogout = () => {
    if (logout && typeof logout === 'function') {
      (logout as () => void)();
    }
    navigate("/login");
  };

  const calculateBMI = (height?: number, weight?: number) => {
    if (!height || !weight) return null;
    const heightM = height / 100;
    return parseFloat((weight / (heightM * heightM)).toFixed(1));
  };

  const calculateAge = (dob?: string) => {
    if (!dob) return healthProfile?.age || null;
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const getHealthScore = () => {
    if (!healthProfile) return null;
    const bmi = calculateBMI(healthProfile.height, healthProfile.weight);
    if (!bmi) return null;

    let score = 100;
    if (bmi > 30) score -= 20;
    else if (bmi > 25) score -= 10;

    if (healthProfile.medicalHistory?.length) {
      const historyCount = healthProfile.medicalHistory.filter(h => h !== "None").length;
      score -= historyCount * 5;
    }
    if (healthProfile.symptoms?.length) {
      const symptomCount = healthProfile.symptoms.filter(s => s !== "None").length;
      score -= symptomCount * 3;
    }

    return Math.max(0, Math.min(100, score));
  };

  const getBMITag = (bmi: number | null) => {
    if (!bmi) return "N/A";
    if (bmi < 18.5) return "Underweight";
    if (bmi < 25) return "Normal";
    if (bmi < 30) return "Overweight";
    return "High";
  };

  const getHealthScoreTag = (score: number | null) => {
    if (score === null) return "N/A";
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Moderate";
    return "Needs Attention";
  };

  const getHealthScoreColor = (score: number | null) => {
    if (score === null) return "text-gray-500";
    if (score >= 80) return "text-emerald-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const handleSidebarClick = (item: string) => {
    setActiveMenuItem(item);
    switch (item) {
      case "Dashboard":
        // Stay on dashboard
        break;
      case "Health Profile":
      case "Medical History":
        navigate("/medical-history");
        break;
      case "Settings":
        navigate("/settings");
        break;
      default:
        break;
    }
  };

  const bmi = healthProfile ? calculateBMI(healthProfile.height, healthProfile.weight) : null;
  const healthScore = getHealthScore();
  const age = calculateAge(healthProfile?.dob);
  
  // Safely get full name with proper type checking
  const getFullName = (): string => {
    if (healthProfile?.firstName && healthProfile?.lastName) {
      return `${healthProfile.firstName} ${healthProfile.lastName}`;
    }
    const userObj = user as User | null | undefined;
    if (userObj?.firstName && userObj?.lastName) {
      return `${userObj.firstName} ${userObj.lastName}`;
    }
    if (userObj?.firstName) {
      return userObj.firstName;
    }
    return "User";
  };
  const fullName = getFullName();

  // Small Health Score Gauge Component for cards
  const HealthScoreGaugeSmall = ({ score }: { score: number | null }) => {
    if (score === null) {
      return (
        <div className="flex flex-col items-center justify-center h-20">
          <span className="text-lg font-bold text-gray-400">N/A</span>
        </div>
      );
    }

    const percentage = score;
    const radius = 24;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;
    const color = score >= 80 ? "#10b981" : score >= 60 ? "#eab308" : "#ef4444";

    return (
      <div className="flex flex-col items-center justify-center">
        <div className="relative w-16 h-16">
          <svg className="transform -rotate-90 w-16 h-16">
            <circle
              cx="32"
              cy="32"
              r={radius}
              stroke="#e5e7eb"
              strokeWidth="6"
              fill="none"
            />
            <circle
              cx="32"
              cy="32"
              r={radius}
              stroke={color}
              strokeWidth="6"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              className="transition-all duration-500"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <span className="text-sm font-bold" style={{ color }}>{score}</span>
            </div>
          </div>
        </div>
      </div>
    );
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
          <div className="max-w-7xl mx-auto">
            {/* Page Header */}
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
                  Welcome, {fullName} <FaHandPaper className="text-yellow-500" />
                </h1>
                <p className="text-slate-600 mt-2">
                  Here's an overview of your health status
                </p>
              </div>
              <button
                onClick={() => navigate("/test-selection", { state: healthProfile })}
                className="bg-slate-900 text-white px-6 py-3 rounded-full hover:bg-slate-800 transition-colors font-medium"
              >
                Run AI Health Analysis
              </button>
            </div>

            {!healthProfile ? (
              <div className="bg-white rounded-2xl shadow-lg p-10 text-center">
                <h2 className="text-2xl font-bold mb-4">No Health Profile Found</h2>
                <p className="text-slate-600 mb-6">
                  Please complete your health profile setup first.
                </p>
                <button
                  onClick={() => navigate("/setup-profile")}
                  className="bg-emerald-600 text-white px-8 py-3 rounded-full hover:bg-emerald-700 transition-colors font-medium"
                >
                  Setup Health Profile
                </button>
              </div>
            ) : (
              <>
                {/* Quick Stats Cards */}
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  {/* Health Score Card */}
                  <div className="bg-white rounded-2xl shadow-md p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm text-slate-500 font-medium">Health Score</h3>
                      <MdHealthAndSafety className="text-3xl text-emerald-600" />
                    </div>
                    <div className="flex items-end justify-between">
                      <div>
                        <div className="text-3xl font-bold text-slate-900">
                          {healthScore ?? "N/A"}
                        </div>
                        <div className={`text-sm mt-1 ${getHealthScoreColor(healthScore)}`}>
                          {getHealthScoreTag(healthScore)}
                        </div>
                      </div>
                      {healthScore !== null && (
                        <div className="ml-4">
                          <HealthScoreGaugeSmall score={healthScore} />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* BMI Card */}
                  <div className="bg-white rounded-2xl shadow-md p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm text-slate-500 font-medium">BMI</h3>
                      <MdMonitorWeight className="text-3xl text-blue-600" />
                    </div>
                    <div className="flex items-end justify-between">
                      <div>
                        <div className="text-3xl font-bold text-slate-900">
                          {bmi ?? "N/A"}
                        </div>
                        <div className="text-sm text-slate-600 mt-1">
                          {getBMITag(bmi)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Blood Pressure Card */}
                  <div className="bg-white rounded-2xl shadow-md p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm text-slate-500 font-medium">Blood Pressure</h3>
                      <MdFavorite className="text-3xl text-red-600" />
                    </div>
                    <div className="flex items-end justify-between">
                      <div>
                        <div className="text-3xl font-bold text-slate-900">
                          {healthProfile.bloodPressure || "N/A"}
                        </div>
                        <div className="text-sm text-slate-600 mt-1">
                          mmHg
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* User Profile Summary Card */}
                <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-slate-900">Your Profile</h2>
                    <button
                      onClick={() => navigate("/medical-history")}
                      className="text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1"
                    >
                      View Full Profile <IoMdArrowForward />
                    </button>
                  </div>
                  <div className="flex items-center gap-6">
                    {healthProfile.profilePicture ? (
                      <img
                        src={healthProfile.profilePicture}
                        alt="Profile"
                        className="w-20 h-20 rounded-full object-cover border-4 border-emerald-500"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center border-4 border-gray-300">
                        <MdPerson className="text-gray-400 text-3xl" />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-1">{fullName}</h3>
                      <p className="text-slate-600 text-sm">
                        Age: {age || "N/A"} • Gender: {healthProfile.gender || "N/A"} • Blood Group: {healthProfile.bloodGroup || "N/A"}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-slate-500">Last Updated</div>
                      <div className="text-sm font-medium text-slate-700">
                        {new Date().toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
                  <h2 className="text-xl font-semibold mb-4 text-slate-900">Quick Actions</h2>
                  <div className="grid md:grid-cols-3 gap-4">
                    <button
                      onClick={() => navigate("/medical-history")}
                      className="p-4 border-2 border-gray-200 rounded-xl hover:border-emerald-500 hover:bg-emerald-50 transition-all text-left"
                    >
                      <MdPerson className="text-3xl text-emerald-600 mb-2" />
                      <h3 className="font-semibold text-slate-900 mb-1">View Health Profile</h3>
                      <p className="text-sm text-slate-600">
                        Review your complete health information
                      </p>
                    </button>
                    <button
                      onClick={() => navigate("/test-selection", { state: healthProfile })}
                      className="p-4 border-2 border-gray-200 rounded-xl hover:border-emerald-500 hover:bg-emerald-50 transition-all text-left"
                    >
                      <FaStethoscope className="text-3xl text-red-600 mb-2" />
                      <h3 className="font-semibold text-slate-900 mb-1">Run Diagnosis</h3>
                      <p className="text-sm text-slate-600">
                        Analyze your health with AI diagnostics
                      </p>
                    </button>
                    <button
                      onClick={() => navigate("/setup-profile")}
                      className="p-4 border-2 border-gray-200 rounded-xl hover:border-emerald-500 hover:bg-emerald-50 transition-all text-left"
                    >
                      <FaUserEdit className="text-3xl text-slate-600 mb-2" />
                      <h3 className="font-semibold text-slate-900 mb-1">Update Profile</h3>
                      <p className="text-sm text-slate-600">
                        Edit your health information
                      </p>
                    </button>
                  </div>
                </div>

                {/* Recent Test Results */}
                {(() => {
                  const allTests: TestResult[] = JSON.parse(
                    localStorage.getItem("novacare_test_results") || "[]"
                  );
                  const userTests = allTests
                    .filter((test: TestResult) => test.userId === healthProfile.userId)
                    .sort((a: TestResult, b: TestResult) => b.timestamp - a.timestamp)
                    .slice(0, 3);

                  if (userTests.length > 0) {
                    return (
                      <div className="bg-white rounded-2xl shadow-md p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h2 className="text-xl font-semibold text-slate-900">Recent Test Results</h2>
                          <button
                            onClick={() => navigate("/medical-history")}
                            className="text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1"
                          >
                            View All <IoMdArrowForward />
                          </button>
                        </div>
                        <div className="space-y-3">
                          {userTests.map((test: TestResult) => (
                            <div
                              key={test.id}
                              className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                              <div>
                                <div className="font-semibold text-slate-900">{test.testName}</div>
                                <div className="text-sm text-slate-500">
                                  {new Date(test.date).toLocaleDateString()}
                                </div>
                              </div>
                              <div className="flex items-center gap-4">
                                <div className="text-right">
                                  <div className={`text-xl font-bold ${getHealthScoreColor(test.riskScore)}`}>
                                    {test.riskScore}%
                                  </div>
                                  <div className={`text-xs ${getHealthScoreColor(test.riskScore)}`}>
                                    {getHealthScoreTag(test.riskScore)}
                                  </div>
                                </div>
                                <button
                                  onClick={() => navigate("/diagnosis-result", { state: test })}
                                  className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                                >
                                  View <IoMdArrowForward />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }
                  return null;
                })()}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

// --- Components ---
const SidebarItem: React.FC<SidebarItemProps> = ({ label, icon, active, onClick }) => (
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

export default Dashboard;
