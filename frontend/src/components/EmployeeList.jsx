import React, { useState, useEffect } from "react";
import "../styless/custom.css"; // Custom CSS file for additional styling

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sending, setSending] = useState(null); // Track sending status
  const [downloading, setDownloading] = useState(null); // Track downloading status

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await fetch("https://payroll.lehigh.co.ke/api/employees");
        if (!response.ok) throw new Error("Failed to fetch employees");

        const data = await response.json();
        setEmployees(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  // ✅ Send Payslip API Call
  const handleSendPayslip = async (email, employee_id) => {
    setSending(employee_id); // Show loading for this employee

    try {
      const response = await fetch("https://payroll.lehigh.co.ke/api/send-payslip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, employee_id }),
      });

      const data = await response.json();
      alert(data.message);
    } catch (error) {
      alert("❌ Failed to send payslip");
    } finally {
      setSending(null); // Reset loading state
    }
  };

  // ✅ Download Payslip API Call
  const handleDownloadPayslip = async (employee_id) => {
    setDownloading(employee_id);

    try {
      const response = await fetch(`https://payroll.lehigh.co.ke/api/download-payslip/${employee_id}`);
      if (!response.ok) throw new Error("Payslip not found");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${employee_id}_payslip.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      alert("❌ Failed to download payslip");
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="text-custom ">Employee List</h2>

      {loading && <p>Loading employees...</p>}
      {error && <p className="text-danger">{error}</p>}

      {!loading && !error && employees.length === 0 && <p>No employees found.</p>}

      {!loading && !error && employees.length > 0 && (
        <table className="table table-bordered table-striped mt-3">
          <thead className="table-dark">
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Total Collection</th>
              <th>Salary Advance</th>
              <th>Incentive</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((employee) => (
              <tr key={employee.employee_id}>
                <td>{employee.employee_id}</td>
                <td>{employee.name}</td>
                <td>{employee.email}</td>
                <td>{employee.total_collection}</td>
                <td>{employee.salary_advance}</td>
                <td>{employee.incentive}</td>
                <td>
                  {/* Send Payslip Button */}
                  <button
                    className="btn btn-custom"
                    onClick={() => handleSendPayslip(employee.email, employee.employee_id)}
                    disabled={sending === employee.employee_id}
                  >
                    {sending === employee.employee_id ? "Sending..." : "Send Payslip"}
                  </button>

                  {/* Download Payslip Button */}
                  <button
                    className="btn btn-custom"
                    onClick={() => handleDownloadPayslip(employee.employee_id)}
                    disabled={downloading === employee.employee_id}
                  >
                    {downloading === employee.employee_id ? "Downloading..." : "Download Payslip"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default EmployeeList;
