import React, { useState } from "react";
import "../styless/custom.css"; // Custom CSS file for additional styling

const UploadEmployeeData = ({ onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setErrorMessage(""); // Reset any previous error
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      setErrorMessage("Please select a file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setIsUploading(true); // Show loading indicator

    try {
      const response = await fetch("https://payroll.lehigh.co.ke/api/upload-excel", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        alert("Employee data uploaded successfully!");
        onUploadSuccess(); // Trigger a refresh of the employee list
      } else {
        const error = await response.json();
        setErrorMessage(error.message || "Failed to upload employee data.");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      setErrorMessage("An error occurred while uploading. Please try again.");
    } finally {
      setIsUploading(false); // Hide loading indicator
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-white rounded shadow-md max-w-md mx-auto">
      <h2 className="h3 text-custom ">Upload Employee Data</h2>

      <div className="mb-3">
        <label htmlFor="file" className="text-custom">Choose Excel File</label>
        <input
          type="file"
          accept=".xlsx"
          onChange={handleFileChange}
          className="form-control"
          id="file"
        />
      </div>

      {errorMessage && (
        <div className="alert alert-danger mb-3" role="alert">
          {errorMessage}
        </div>
      )}

      <button
        type="submit"
        className="btn btn-custom btn-custom-full"
        disabled={isUploading}
      >
        {isUploading ? "Uploading..." : "Upload"}
      </button>
    </form>
  );
};

export default UploadEmployeeData;
