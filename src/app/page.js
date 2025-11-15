"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import UploadProgress from "./components/UploadProgress";
import CardTypeToggle from "./components/CardTypeToggle";
import ImagePreviewGrid from "./components/ImagePreviewGrid";
import FileUploadInput from "./components/FileUploadInput";
import SuccessDownload from "./components/SuccessDownload";
import NavigationBar from "./components/NavigationBar";
import ConsentDialog from "./components/ConsentDialog";

export default function Home() {
  const [files, setFiles] = useState(null);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [outputUrl, setOutputUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cardType, setCardType] = useState("single"); // "single" or "double"
  const [showConsent, setShowConsent] = useState(false);
  const { data: session, status } = useSession();

  const handleFileSelect = (e) => {
    const selectedFiles = e.target.files;
    if (selectedFiles.length > 0) {
      // Create preview URLs for newly selected images
      const newPreviewUrls = Array.from(selectedFiles).map(file => ({
        file: file,
        url: URL.createObjectURL(file)
      }));
      
      // Append new files to existing ones
      const updatedPreviews = [...imagePreviews, ...newPreviewUrls];
      setImagePreviews(updatedPreviews);
      
      // Combine existing files with new files
      const dt = new DataTransfer();
      updatedPreviews.forEach(preview => dt.items.add(preview.file));
      setFiles(dt.files);
    }
  };

  const handleDeleteImage = (index) => {
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setImagePreviews(newPreviews);
    
    // Convert remaining previews back to a FileList-like object
    const dt = new DataTransfer();
    newPreviews.forEach(preview => dt.items.add(preview.file));
    setFiles(dt.files);
  };

  const handleUpload = async () => {
    if (!files || files.length === 0) {
      toast.error("Please select at least one photo!");
      return;
    }

    // Show consent dialog instead of immediate upload
    setShowConsent(true);
  };

  const handleUploadConfirmed = async () => {
    setShowConsent(false);
    setLoading(true);
    setOutputUrl(null);

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append("files", files[i]); // "files" key matches your n8n webhook input
    }

    try {
      // Use different webhook URLs based on card type
      const webhookUrl = cardType === "single" 
        ? process.env.NEXT_PUBLIC_WEBHOOK_URL_SINGLE 
        : process.env.NEXT_PUBLIC_WEBHOOK_URL_DOUBLE;

      if (!webhookUrl) {
        throw new Error("Webhook URL not configured for " + cardType + " sided cards");
      }

      const res = await fetch(webhookUrl, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      // Assuming n8n returns the .vcf as binary output
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      setOutputUrl(url);
      toast.success("VCF file created successfully!");
    } catch (err) {
      console.error("Upload failed", err);
      toast.error("Something went wrong while uploading!");
    } finally {
      setLoading(false);
    }
  };

  const handleConvertAnother = () => {
    setOutputUrl(null);
    setFiles(null);
    setImagePreviews([]);
  };

  return (
    <main className="flex flex-col items-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-100 p-6 relative">
      <NavigationBar />

      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 flex flex-col items-center border border-gray-100 mt-12">
        <h1 className="text-3xl font-bold mb-6 text-gray-800 tracking-tight text-center drop-shadow-sm">
          Kamyab VCF Converter
        </h1>

        {/* Show upload progress when loading */}
        {loading && <UploadProgress imageCount={imagePreviews.length} />}

        {/* Card Type Toggle */}
        {!outputUrl && !loading && (
          <CardTypeToggle cardType={cardType} onToggle={setCardType} />
        )}

        {/* Custom file input */}
        {!outputUrl && !loading && (
          <FileUploadInput
            hasImages={imagePreviews.length > 0}
            onFileSelect={handleFileSelect}
          />
        )}

        {/* Image Previews */}
        {!outputUrl && !loading && (
          <ImagePreviewGrid
            imagePreviews={imagePreviews}
            onDeleteImage={handleDeleteImage}
          />
        )}

        {!outputUrl && !loading && (
          <button
            onClick={handleUpload}
            disabled={!files}
            className={`w-full py-3 mt-2 rounded-xl font-semibold text-lg shadow-md transition-all duration-200
              ${!files ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-gradient-to-r from-blue-600 to-purple-500 text-white hover:shadow-lg"}`}
          >
            Upload & Convert
          </button>
        )}

        {outputUrl && (
          <SuccessDownload
            outputUrl={outputUrl}
            onConvertAnother={handleConvertAnother}
          />
        )}
      </div>
      
      <footer className="mt-10 text-xs text-gray-400 text-center">
        &copy; {new Date().getFullYear()} Kamyab VCF Converter. All rights reserved.
      </footer>

      {/* Consent Dialog */}
      <ConsentDialog
        isOpen={showConsent}
        onClose={() => setShowConsent(false)}
        onConfirm={handleUploadConfirmed}
        cardType={cardType}
        imageCount={files ? files.length : 0}
      />
    </main>
  );
}
