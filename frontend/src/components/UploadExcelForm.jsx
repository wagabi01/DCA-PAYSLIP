import React, { useState } from 'react';

const UploadExcelForm = () => {
    const [file, setFile] = useState(null);
    const [message, setMessage] = useState('');

    const handleUpload = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('https://payroll.lehigh.co.ke/api/upload-excel', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();
            setMessage(data.message);
        } catch (error) {
            setMessage('Error uploading file');
        }
    };

    return (
        <div className="container mt-4">
            <h2 className="text-center mb-4">Upload Employee Data</h2>
            <form onSubmit={handleUpload} className="bg-white p-4 rounded shadow-sm">
                {message && <div className="alert alert-success mb-3">{message}</div>}
                <div className="mb-3">
                    <label htmlFor="file" className="form-label">Choose Excel File</label>
                    <input
                        type="file"
                        className="form-control"
                        id="file"
                        accept=".xlsx, .xls"
                        onChange={(e) => setFile(e.target.files[0])}
                        required
                    />
                </div>
                <button type="submit" className="btn btn-primary w-100 mt-3">
                    Upload
                </button>
            </form>
        </div>
    );
};

export default UploadExcelForm;
