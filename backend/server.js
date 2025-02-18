require("dotenv").config();
const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const fs = require("fs");
const nodemailer = require("nodemailer");
const puppeteer = require("puppeteer");
const multer = require("multer");
const xlsx = require("xlsx");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

// Set up Multer for file uploads
const upload = multer({ dest: "uploads/" });

const app = express();

// Middleware
app.use(cors({ origin: "http://localhost:5173", methods: ["GET", "POST"], allowedHeaders: ["Content-Type"] }));
app.use(bodyParser.json());

// MySQL Database Connection
const db = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "payrollDB",
});

// Ensure 'payslips' directory exists
const payslipsDir = path.join(__dirname, "payslips");
if (!fs.existsSync(payslipsDir)) fs.mkdirSync(payslipsDir);

// ✅ **Test Route**
app.get("/", (req, res) => res.send("✅ Server is running"));

// ✅ **Fetch All Employees**
app.get("/employees", async (req, res) => {
  try {
    const [employees] = await db.query("SELECT * FROM employees");
    res.status(200).json(employees);
  } catch (err) {
    res.status(500).json({ message: "❌ Error fetching employees", error: err.message });
  }
});

// ✅ **Add Employee**
app.post("/add-employee", async (req, res) => {
  const { name, email, employee_id, acc_number, bank_name, total_collection, salary_advance, incentive } = req.body;

  if (!name || !email || !employee_id) {
    return res.status(400).json({ message: "❌ All fields are required" });
  }

  try {
    await db.query(
      "INSERT INTO employees (name, email, employee_id, acc_number, bank_name, total_collection, salary_advance, incentive) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [name, email, employee_id, acc_number, bank_name, total_collection, salary_advance, incentive]
    );
    res.status(201).json({ message: "✅ Employee added successfully!" });
  } catch (error) {
    res.status(500).json({ message: "❌ Failed to add employee", error: error.message });
  }
});

// ✅ **Generate & Send Payslip**
app.post("/send-payslip", async (req, res) => {
  const { email, employee_id } = req.body;

  if (!email || !employee_id) return res.status(400).json({ message: "❌ Email and Employee ID required" });

  try {
    const [employeeData] = await db.query("SELECT * FROM employees WHERE employee_id = ?", [employee_id]);

    if (!employeeData.length) return res.status(404).json({ message: "❌ Employee not found" });

    const employee = employeeData[0];
    const totalCollection = parseFloat(employee.total_collection);
    let retainer = 0,
      commission = totalCollection * 0.02;
    if (totalCollection >= 600000) retainer = 10000;
    else if (totalCollection >= 200000 && totalCollection <= 599999) retainer = 5000;
    else(retainer = 0);
    const salo = Number((retainer + commission).toFixed(2));
    let withholding = salo >= 24000 ? salo * 0.05 : 0;
    const salary = Number((retainer + commission + parseFloat(employee.incentive) - parseFloat(employee.salary_advance) - withholding).toFixed(2));

    /// Generate Payslip PDF
const filePath = path.join(payslipsDir, `${employee_id}_payslip.pdf`);
const browser = await puppeteer.launch({ headless: true, args: ["--no-sandbox", "--disable-setuid-sandbox"] });
const page = await browser.newPage();

// ✅ Payslip HTML Content
const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payslip</title>
    <style>
        body { font-family: Arial, sans-serif; text-align: center; margin: 0; padding: 20px; }
        .header { text-align: center; margin-bottom: 20px; }
        .header img { width: 100px; height: auto; }
        .header h1 { margin: 5px 0; font-size: 20px; color:rgb(11, 107, 202); }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
        th { background-color:rgba(246, 249, 252, 0.89); color: black; }
        .footer { margin-top: 20px; font-size: 12px; color: #555; }
    </style>
</head>
<body>

    <div class="header">
        <img src="http://localhost:5173/src/assets/Site-logo.png" alt="Company Logo">
        <h1>LEHIGH RECOVERIES LIMITED</h1>
        <p><strong>Payslip for ${employee.name}</strong></p>
    </div>

    <table>
        <tr>
            <th>Employee Name</th>
            <td>${employee.name}</td>
        </tr>
         <tr>
            <th>Account Number</th>
            <td>${employee.acc_number}</td>
        </tr>
         <tr>
            <th>Bank Name</th>
            <td>${employee.bank_name}</td>
        </tr>
        <tr>
            <th>Total Collection</th>
            <td>Ksh. ${employee.total_collection.toLocaleString()}</td>
        </tr>
        <tr>
            <th>Retainer</th>
            <td>Ksh. ${retainer.toLocaleString()}</td>
        </tr>
        <tr>
            <th>Commission</th>
            <td>Ksh. ${commission.toLocaleString()}</td>
        </tr>
        <tr>
            <th>Incentive</th>
            <td>Ksh. ${employee.incentive.toLocaleString()}</td>
        </tr>
        <tr>
            <th>Salary Advance</th>
            <td>Ksh. ${employee.salary_advance.toLocaleString()}</td>
        </tr>
        <tr>
            <th>Withholding</th>
            <td>Ksh. ${withholding.toLocaleString()}</td>
        </tr>
        <tr>
            <th><strong>Total Salary</strong></th>
            <td><strong>Ksh. ${salary.toLocaleString()}</strong></td>
        </tr>
    </table>

    <p class="footer">This is a system-generated payslip and does not require a signature.</p>

</body>
</html>
`;

// ✅ Generate PDF from HTML
await page.setContent(htmlContent, { waitUntil: "networkidle0" });
await page.pdf({ path: filePath, format: "A5" });
await browser.close();


    // ✅ **Send Email**
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: { user: process.env.EMAIL, pass: process.env.EMAIL_PASSWORD },
    });

    await transporter.sendMail({
      from: process.env.EMAIL,
      to: email,
      subject: "Your Payslip",
      text: "Find attached your payslip.",
      attachments: [{ filename: `${employee_id}_payslip.pdf`, path: filePath }],
    });

    res.status(200).json({ message: "✅ Payslip sent successfully!" });
  } catch (error) {
    res.status(500).json({ message: "❌ Failed to send payslip", error: error.message });
  }
});
// ✅ Download Payslip API
app.get("/download-payslip/:employee_id", (req, res) => {
    const { employee_id } = req.params;
    const filePath = path.join(__dirname, "payslips", `${employee_id}_payslip.pdf`);
  
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "❌ Payslip not found" });
    }
  
    res.download(filePath);
  });
  
app.post("/upload-excel", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "❌ No file uploaded" });
  }

  try {
    const filePath = req.file.path;
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    if (sheetData.length === 0) {
      return res.status(400).json({ message: "❌ Empty Excel file" });
    }

    // Extract and insert employee data
    const employees = sheetData.map((row) => [
      row.employee_id,
      row.name,
      row.email,
      row.acc_number,
      row.bank_name,
      row.total_collection || 0,
      row.salary_advance || 0,
      row.incentive || 0,
    ]);

    const sql = `
      INSERT INTO employees (employee_id, name, email, acc_number, bank_name, total_collection, salary_advance, incentive) 
      VALUES ? 
      ON DUPLICATE KEY UPDATE 
        name = VALUES(name), 
        email = VALUES(email), 
        acc_number = VALUES(acc_number), 
        bank_name = VALUES(bank_name),
        total_collection = VALUES(total_collection),
        salary_advance = VALUES(salary_advance),
        incentive = VALUES(incentive)
    `;

    await db.query(sql, [employees]);

    res.status(200).json({ message: `✅ Successfully uploaded ${employees.length} employees!` });
  } catch (error) {
    res.status(500).json({ message: "❌ Error processing Excel file", error: error.message });
  }
});
// ✅ Login Endpoint
app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "❌ Email and password are required" });
    }

    try {
        // ✅ Check if user exists
        const [user] = await db.query("SELECT * FROM users WHERE email = ?", [email]);

        if (user.length === 0) {
            return res.status(401).json({ message: "❌ Invalid email or password" });
        }

        const validPassword = await bcrypt.compare(password, user[0].password);

        if (!validPassword) {
            return res.status(401).json({ message: "❌ Invalid email or password" });
        }

        // ✅ Generate JWT Token
        const token = jwt.sign({ userId: user[0].id, email: user[0].email }, process.env.JWT_SECRET, { expiresIn: "1h" });

        res.status(200).json({ message: "✅ Login successful", token });
    } catch (error) {
        res.status(500).json({ message: "❌ Server error", error: error.message });
    }
});

// Start Server
const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`✅ Server running on port ${port}`));
