import React, { useState } from "react";
import AddEmployeeForm from "../components/AddEmployeeForm";
import EmployeeList from "../components/EmployeeList";
import UploadEmployeeData from "../components/UploadEmployeeData";
import logo from "../assets/Site-logo.png"; // Ensure the logo is in the assets folder
import "../styless/custom.css"; // Custom CSS file for additional styling

const Dashboard = () => {
  const [refreshList, setRefreshList] = useState(false);

  const handleUploadSuccess = () => {
    setRefreshList(prevState => !prevState); // Toggle the refreshList state
  };

  return (
    <div className="container p-4">
      {/* Dashboard Header with Company Name and Logo */}
      <header className="d-flex align-items-center mb-4 bg-custom p-3 rounded">
        {/* Logo */}
        <img src={logo} alt="Lehigh Recoveries Logo" className="logo me-3" />

        {/* Company Name */}
        <h1 className="h1 title"><b>ELITE DEBT MANAGEMENT</b></h1>
      </header>

      {/* Add Employee Form */}
      <section className="mb-4">
        <div className="card shadow-sm border-0">
          <div className="card-body">
            {/* <h4 className="card-title text-custom">Add Employee</h4> */}
            <AddEmployeeForm onAddEmployee={handleUploadSuccess} />
          </div>
        </div>
      </section>

      {/* Upload Employee Data Form */}
      <section className="mb-4">
        <div className="card shadow-sm border-0">
          <div className="card-body">
            {/* <h4 className="card-title text-custom">Upload Employee Data</h4> */}
            <UploadEmployeeData onUploadSuccess={handleUploadSuccess} />
          </div>
        </div>
      </section>

      {/* Employee List Display */}
      <section>
        <div className="card shadow-sm border-0">
          <div className="card-body">
            {/* <h4 className="card-title text-custom">Employee List</h4> */}
            <EmployeeList refresh={refreshList} />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
