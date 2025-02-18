import React, { useState } from 'react';

const PayslipPage = () => {
    const [employeeId, setEmployeeId] = useState('');
    const [email, setEmail] = useState('');

    const handleSendPayslip = async () => {
        try {
            const response = await fetch('/send-payslip', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ employee_id: employeeId, email }),
            });
            const data = await response.json();
            alert(data.message);
        } catch (error) {
            console.error('Error sending payslip:', error);
            alert('Failed to send payslip');
        }
    };

    const handleDownloadPayslip = () => {
        window.location.href = `/downloads/${employeeId}_payslip.pdf`;
    };

    return (
        <div>
            <input
                type="text"
                placeholder="Employee ID"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
            />
            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            <button onClick={handleSendPayslip}>Send Payslip</button>
            <button onClick={handleDownloadPayslip}>Download Payslip</button>
        </div>
    );
};

export default PayslipPage;
