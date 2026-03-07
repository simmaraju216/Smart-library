import { useAuth } from "../../context/AuthContext";
import { useEffect, useState } from "react";

const Profile = () => {
  const { user, refreshProfile, updateProfile } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });

  const showValue = (value) => {
    const text = String(value ?? "").trim();
    return text.length > 0 ? text : "Not available";
  };

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);

        const current = await refreshProfile();
        const source = current || user;

        setProfileData(source || null);

        setForm({
          name: source?.name || "",
          email: source?.email || "",
          phone: source?.phone || "",
        });
      } catch (error) {
        setStatus({
          type: "error",
          message: error?.response?.data?.message || "Unable to load profile",
        });
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSave = async () => {
    if (form.name.trim().length < 2) {
      setStatus({
        type: "error",
        message: "Name must be at least 2 characters",
      });
      return;
    }

    try {
      setSaving(true);

      const response = await updateProfile({
        name: form.name,
        email: form.email,
        phone: form.phone,
      });

      if (response?.user) {
        setProfileData(response.user);
      }

      setStatus({
        type: "success",
        message: response?.message || "Profile updated successfully",
      });
    } catch (error) {
      setStatus({
        type: "error",
        message: error?.response?.data?.message || "Update failed",
      });
    } finally {
      setSaving(false);
    }
  };

  const onReset = () => {
    const source = profileData || user;

    setForm({
      name: source?.name || "",
      email: source?.email || "",
      phone: source?.phone || "",
    });

    setStatus({ type: "", message: "" });
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow p-6">
        <p className="text-slate-600">Loading profile...</p>
      </div>
    );
  }

  const details = profileData || user || {};

  return (
    <div className="w-full max-w-5xl mr-auto ml-0 space-y-6">

      {/* PROFILE HEADER */}
      <div className="bg-white shadow rounded-xl p-6 flex items-center gap-5">
        <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl font-bold">
          {details?.name?.charAt(0)?.toUpperCase() || "U"}
        </div>

        <div>
          <h2 className="text-xl font-bold text-slate-800">
            {showValue(details?.name)}
          </h2>
          <p className="text-sm text-slate-500">{showValue(details?.email)}</p>
          <p className="text-xs text-slate-400 capitalize">
            Role: {showValue(details?.role)}
          </p>
        </div>
      </div>

      {/* USER DETAILS */}
      <div className="bg-white shadow rounded-xl p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">
          User Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <p><span className="font-medium">Phone:</span> {showValue(details?.phone)}</p>
          <p><span className="font-medium">Student ID:</span> {showValue(details?.student_id)}</p>
          <p><span className="font-medium">User ID:</span> {showValue(details?.id)}</p>
          <p><span className="font-medium">Year:</span> {showValue(details?.year)}</p>
          <p><span className="font-medium">Batch:</span> {showValue(details?.batch_name)}</p>
          <p><span className="font-medium">Branch:</span> {showValue(details?.branch_name)}</p>
          <p>
            <span className="font-medium">Joined:</span>{" "}
            {details?.created_at
              ? new Date(details.created_at).toLocaleString()
              : "Not available"}
          </p>
        </div>
      </div>

      {/* EDIT PROFILE */}
      <div className="bg-white shadow rounded-xl p-6 space-y-4">
        <h3 className="text-lg font-semibold text-slate-800">
          Edit Profile
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <div>
            <label className="text-sm font-medium">Name</label>
            <input
              name="name"
              value={form.name}
              onChange={onChange}
              className="w-full mt-1 border rounded-lg px-3 py-2"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Email</label>
            <input
              name="email"
              value={form.email}
              onChange={onChange}
              className="w-full mt-1 border rounded-lg px-3 py-2"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Phone</label>
            <input
              name="phone"
              value={form.phone}
              onChange={onChange}
              className="w-full mt-1 border rounded-lg px-3 py-2"
              placeholder="Optional"
            />
          </div>

        </div>

        {/* BUTTONS */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={onSave}
            disabled={saving}
            className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>

          <button
            onClick={onReset}
            className="bg-gray-100 px-5 py-2 rounded-lg hover:bg-gray-200"
          >
            Reset
          </button>
        </div>

        {status.message && (
          <p className={`text-sm ${status.type === "success" ? "text-green-600" : "text-red-600"}`}>
            {status.message}
          </p>
        )}
      </div>

    </div>
  );
};

export default Profile;