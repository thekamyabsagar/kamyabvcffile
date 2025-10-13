"use client";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [files, setFiles] = useState(null);
  const [outputUrl, setOutputUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const { data: session, status } = useSession();

  const handleUpload = async () => {
    if (!files || files.length === 0) {
      alert("Please select at least one photo!");
      return;
    }

    setLoading(true);
    setOutputUrl(null);

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append("files", files[i]); // "files" key matches your n8n webhook input
    }

    try {
      const webhookUrl = process.env.NEXT_PUBLIC_WEBHOOK_URL;
      const res = await fetch(webhookUrl, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      // Assuming n8n returns the .vcf as binary output
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      setOutputUrl(url);
    } catch (err) {
      console.error("Upload failed", err);
      alert("Something went wrong while uploading!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex flex-col items-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-100 p-6 relative">
      {/* Logout button */}
      <button
        onClick={() => signOut()}
        className="absolute top-4 right-4 px-4 py-2 bg-white text-gray-700 rounded-lg shadow-md hover:bg-gray-100 transition-all duration-200 text-sm font-medium border border-gray-200"
      >
        Logout
      </button>

      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 flex flex-col items-center border border-gray-100 mt-12">
        <h1 className="text-3xl font-bold mb-6 text-gray-800 tracking-tight text-center drop-shadow-sm">Bulk Photo to VCF Converter</h1>

        {/* Custom file input */}
        <label htmlFor="file-upload" className="cursor-pointer w-full flex flex-col items-center justify-center py-6 px-4 mb-6 border-2 border-dashed border-blue-300 rounded-xl bg-blue-50 hover:bg-blue-100 transition-all duration-200 shadow-sm">
          <svg width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="mb-2 text-blue-500">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M4 12l4-4m0 0l4 4m-4-4v12" />
          </svg>
          <span className="text-blue-700 font-medium">Choose Photos</span>
          <span className="text-xs text-gray-500 mt-1">(You can select multiple images)</span>
          <input
            id="file-upload"
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => setFiles(e.target.files)}
            className="hidden"
          />
        </label>

        {/* Show selected files */}
        {files && files.length > 0 && (
          <div className="w-full mb-4 text-sm text-gray-700 bg-blue-50 rounded-lg p-2 border border-blue-200">
            <span className="font-semibold">Selected:</span>
            <ul className="list-disc ml-5 mt-1">
              {Array.from(files).map((file, idx) => (
                <li key={idx}>{file.name}</li>
              ))}
            </ul>
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={!files || loading}
          className={`w-full py-3 mt-2 rounded-xl font-semibold text-lg shadow-md transition-all duration-200
            ${!files || loading ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-gradient-to-r from-blue-600 to-purple-500 text-white hover:scale-105 hover:shadow-lg"}`}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="white" strokeWidth="4" fill="none" /></svg>
              Processing...
            </span>
          ) : "Upload & Convert"}
        </button>

        {outputUrl && (
          <a
            href={outputUrl}
            download="Contact.vcf"
            className="mt-8 w-full py-3 rounded-xl bg-green-500 text-white font-bold text-center shadow-lg hover:bg-green-600 transition-all duration-200"
          >
            Download .vcf File
          </a>
        )}
      </div>
      <footer className="mt-10 text-xs text-gray-400 text-center">&copy; {new Date().getFullYear()} VCF Extractor. All rights reserved.</footer>
    </main>
  );
}
