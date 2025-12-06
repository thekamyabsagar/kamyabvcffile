"use client";
import { CiUser, CiMail } from "react-icons/ci";
import { HiOutlineGlobeAlt, HiOutlinePhone, HiOutlineOfficeBuilding, HiOutlinePencil } from "react-icons/hi";

const ProfileInfoDisplay = ({ userProfile, email, onEditClick }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200/50">
      <div className="p-6 border-b border-slate-200/50">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
              <CiUser className="w-5 h-5 text-indigo-600" />
              Profile Information
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Your personal details
            </p>
          </div>
          <button
            onClick={onEditClick}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors"
          >
            <HiOutlinePencil className="w-4 h-4" />
            Edit
          </button>
        </div>
      </div>

      <div className="p-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Username</label>
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
              <CiUser className="w-4 h-4 text-slate-400" />
              <span className="text-slate-900">{userProfile.username || "Not set"}</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Email</label>
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
              <CiMail className="w-4 h-4 text-slate-400" />
              <span className="text-slate-900">{email}</span>
            </div>
            <p className="text-xs text-slate-500">Email cannot be changed</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Country</label>
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <HiOutlineGlobeAlt className="w-4 h-4 text-slate-400" />
                <span className="text-slate-900">{userProfile.country || "Not set"}</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Phone Number</label>
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <HiOutlinePhone className="w-4 h-4 text-slate-400" />
                <span className="text-slate-900">{userProfile.phoneNumber || "Not set"}</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Company Name</label>
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
              <HiOutlineOfficeBuilding className="w-4 h-4 text-slate-400" />
              <span className="text-slate-900">{userProfile.companyName || "Not set"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileInfoDisplay;
