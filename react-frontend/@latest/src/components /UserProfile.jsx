// src/pages/UserProfile.jsx
import React , {useState, useEffect} from "react";
import TypingText from "./typing-text";
import { useUserAuth } from "./UserAuthContext";
const UserProfile = () => {
    const { user } = useUserAuth(); // auth user (has email, maybe displayName)
    const [profile, setProfile] = useState(null);    // data from your DB
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [casesCount, setCasesCount] = useState(0);  
    const [date, setDate] = useState("");
    useEffect(() => {
      const fetchProfile = async () => {
        try {
          if (!user || !user.email) return;
  
          setLoading(true);
          setError("");
  
          const res = await fetch(
            `http://localhost:4000/api/user-by-email?email=${encodeURIComponent(user.email)}`
          ); // 👈 goes to Node proxy
  
          const data = await res.json();
          setDate(new Date(data.created_at).toLocaleDateString());
          if (!res.ok) {
            throw new Error(data.detail || "Failed to load profile");
          }
  
          setProfile(data);
        } catch (err) {
          console.error("Error fetching profile:", err);
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
  
      fetchProfile();
    }, [user]);
    const user1 = {
        name: profile?.name || user.name ,
        email: profile?.email || user.email,
        role:  "Volunteer",
        joinedAt: date
      };  
    useEffect(()=>{
        const fetchCasesCount = async () => {
            if (!user || !user.email) return;
            try{
                const res = await fetch(`http://localhost:4000/api/registercount?submitted_by=${encodeURIComponent(user.email)}&status=NF`);
                const data = await res.json();
                setCasesCount(data.count || 0);
            }catch(err){
                console.error("Error fetching NF count:", err);
            }
        }

        fetchCasesCount();
    }, [user])
 

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-gray-900">
            {/* Page container */}
            <div className="max-w-5xl mx-auto px-4 py-8">
                {/* Heading */}
                <header className="mb-8">
                    <TypingText
                        text={["Hi again hero ! This is your story so far", "this is where your efforts come together", "thanks for being here!"]}
                        className="mt-2 text-slate-600 dark:text-white text-extrabold text-2xl"
                        typingSpeed={40}
                        initialDelay={300}
                        pauseDuration={2000}
                        showCursor={true}
                        cursorCharacter="|"
                    />
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-[1.1fr,1.4fr] gap-6">
                    {/* LEFT COLUMN – Profile card */}
                    <section className="bg-white dark:bg-gray-300 rounded-2xl shadow-sm p-6 flex flex-col gap-4">
                        <div className="flex items-start gap-4">
                            {/* Avatar */}
                            <div className="relative">
                                {user1.avatarUrl ? (
                                    <img
                                        src={user.avatarUrl}
                                        alt={user.name}
                                        className="w-20 h-20 rounded-full object-cover border border-slate-200"
                                    />
                                ) : (
                                    <div className="w-20 h-20 rounded-full bg-slate-200 dark:bg-slate-100 flex items-center justify-center text-2xl font-semibold text-slate-700">
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </div>

                            {/* Basic info */}
                            <div className="flex-1">
                                <h2 className="text-xl font-semibold text-slate-900">
                                    {user1.name}
                                </h2>
                                <p className="text-sm text-slate-600">{user1.email}</p>
                                <span className="inline-flex items-center mt-2 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium">
                                    {user1.role}
                                </span>

                                <div className="mt-3 space-y-1 text-sm text-slate-600">
                                    <p>
                                        <span className="font-medium text-slate-800 ">
                                            Member since: 
                                        </span>{user1.joinedAt}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Quick stats */}
                        <div className="mt-4 flex justify-center">
                            <div className="rounded-xl border w-100 flex flex-col  justify-center border-slate-100 dark:bg-slate-200 px-4 py-3">
                                <p className="text-md uppercase tracking-wide text-slate-800 text-center">
                                    Cases reported
                                </p>
                                <p className="mt-1 text-2xl font-semibold text-slate-900 text-center">
                                    {casesCount}
                                </p>
                            </div>
                            
                        </div>
                    </section>

                    {/* RIGHT COLUMN – Details / Settings */}
                    <section className="bg-white dark:bg-gray-300 rounded-2xl shadow-sm p-6">
                        <h3 className="text-lg font-semibold text-slate-900">
                            Account details
                        </h3>
                        <p className="text-sm text-slate-600 mb-4">
                            Update your personal information to keep your account accurate.
                        </p>

                        <form
                            className="space-y-4"
                            onSubmit={(e) => {
                                e.preventDefault();
                                alert("Profile save not wired yet 🙂");
                            }}
                        >
                            {/* Name */}
                            <div>
                                <label
                                    htmlFor="name"
                                    className="block text-sm font-medium text-slate-700 mb-1"
                                >
                                    Full name
                                </label>
                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    defaultValue={user1.name}
                                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-200"
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <label
                                    htmlFor="email"
                                    className="block text-sm font-medium text-slate-700 mb-1"
                                >
                                    Email address
                                </label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    defaultValue={user1.email}
                                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-200"
                                />
                                <p className="mt-1 text-xs text-slate-500">
                                    We’ll use this to send you important updates and notifications.
                                </p>
                            </div>

                            
                        </form>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;
