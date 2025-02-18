import React, { useState } from "react";
import "../styless/custom.css"; // Custom CSS file for additional styling

const AddEmployeeForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    employee_id: "",
    total_collection: "",
    salary_advance: "",
    incentive: "",
    acc_number: "",
    bank_name: "",
  });

  const [message, setMessage] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    try {
      const response = await fetch("https://payroll.lehigh.co.ke/api/add-employee", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message);

      setMessage({ type: "success", text: "✅ Employee added successfully!" });
      setFormData({
        name: "",
        email: "",
        employee_id: "",
        total_collection: "",
        salary_advance: "",
        incentive: "",
        acc_number: "",
        bank_name: "",
      });
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="text-custom ">Add Employee</h2>

      {message && <div className={`alert alert-${message.type === "error" ? "danger" : "success"}`}>{message.text}</div>}

      <form onSubmit={handleSubmit}>
        {["name", "email", "acc_number", "bank_name", "employee_id", "total_collection", "salary_advance", "incentive"].map((field) => (
          <div className="mb-3" key={field}>
            <label className="form-label">{field.replace("_", " ").toUpperCase()}</label>
            <input
              type={field === "email" ? "email" : "text"}
              className="form-control"
              name={field}
              value={formData[field]}
              onChange={handleChange}
              required
            />
          </div>
        ))}

        <button type="submit" className="btn btn-custom btn-custom-full">Add Employee</button>
      </form>
    </div>
  );
};

export default AddEmployeeForm;
