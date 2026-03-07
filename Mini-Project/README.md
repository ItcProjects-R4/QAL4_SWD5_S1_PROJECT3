<h1 align="center">🎓 Student Management System</h1>

<p align="center">
<b>Console Application built using C# and SQL Server</b><br>
A practical .NET learning project
</p>

<hr>

<h2>📌 Project Overview</h2>
<p>
Student Management System is a simple Console Application developed using
<strong>C#</strong> and <strong>SQL Server</strong>.  
The system allows users to add, view, and delete students while storing data in a database
using a Stored Procedure and retrieving data through a SQL View.
</p>

<hr>

<h2>🎯 Project Goals</h2>
<ul>
<li>Apply Object-Oriented Programming (OOP)</li>
<li>Practice Encapsulation & Access Modifiers</li>
<li>Use Loops and Conditions</li>
<li>Work with Lists</li>
<li>Connect C# to SQL Server using ADO.NET</li>
<li>Execute Stored Procedures</li>
<li>Work with SQL Views</li>
<li>Practice teamwork</li>
</ul>

<hr>

<h2>🏗️ Technologies Used</h2>
<ul>
<li><strong>C#</strong></li>
<li><strong>.NET Console Application</strong></li>
<li><strong>SQL Server</strong></li>
<li><strong>ADO.NET</strong></li>
<li><strong>Stored Procedures</strong></li>
<li><strong>SQL Views</strong></li>
</ul>

<hr>

<h2>⚡ Quick Setup</h2>

<ol>
<li>Open SQL Server</li>
<li>Run the SQL script inside the project</li>
<li><code>Database/StudentDB.sql</code></li>
<li>Run the C# project</li>
</ol>

<hr>

<h2>▶️ How to Run</h2>

<ol>

<li>Open SQL Server</li>

<li>Run the SQL script inside the project
(<code>SQLQuery1.sql</code>)</li>

<li>This will create:
<ul>
<li>Database</li>
<li>Table</li>
<li>Stored Procedure</li>
<li>View</li>
</ul>
</li>

<li>Open the project in Visual Studio</li>

<li>Run the Console Application</li>

</ol>

<hr>

<h2>🗄️ Database Structure</h2>

<h3>Database Name</h3>
<p><code>StudentDB</code></p>

<h3>Table: Students</h3>

<table border="1" cellpadding="8">
<tr>
<th>Column</th>
<th>Type</th>
<th>Description</th>
</tr>

<tr>
<td>Id</td>
<td>INT (PK, Identity)</td>
<td>Auto-generated Student ID</td>
</tr>

<tr>
<td>St_Name</td>
<td>NVARCHAR(100)</td>
<td>Student Name</td>
</tr>

<tr>
<td>Age</td>
<td>INT</td>
<td>Student Age</td>
</tr>

<tr>
<td>Grade</td>
<td>FLOAT</td>
<td>Student Grade</td>
</tr>

</table>

<hr>

<h2>⚙️ Application Features</h2>

<h3>➕ Add Student</h3>
<ul>
<li>User enters Name, Age, and Grade</li>
<li>Data is validated before saving</li>
<li>Stored Procedure is executed from C#</li>
<li>Student is inserted into SQL Server database</li>
</ul>

<h3>📋 Show Students</h3>
<ul>
<li>Retrieve all students from database</li>
<li>Data is read using a SQL View</li>
<li>Students are displayed using a loop</li>
<li><code>PrintInfo()</code> method is called</li>
</ul>

<h3>❌ Delete Student</h3>
<ul>
<li>User enters student name</li>
<li>Student is searched inside the system</li>
<li>If found, the student is removed</li>
</ul>

<hr>

<h2>🧠 Concepts Implemented</h2>

<ul>
<li>Classes & Objects</li>
<li>Constructor</li>
<li>Encapsulation</li>
<li>Access Modifiers</li>
<li>Loops (while / foreach)</li>
<li>Conditions (if / switch)</li>
<li>Lists</li>
<li>Database Connectivity</li>
<li>Stored Procedure Execution</li>
<li>Reading Data using SqlDataReader</li>
</ul>

<hr>

<h2>👥 Team Members</h2>

<ul>
<li><strong>Shahd</strong> – Database Design</li>
<li><strong>Mariam</strong> – Database Connection</li>
<li><strong>Abdelrahman</strong> – C# Development (Student Class)</li>
<li><strong>Baher</strong> – Menu & User Interface</li>
<li><strong>Naglaa</strong> – Program Logic</li>
</ul>

<hr>

<h2>📂 Project Structure</h2>

<pre>
DEPI-MINIPROJECT1
│
├── Models
│   └── Student.cs
│
├── Data
│   └── DatabaseHelper.cs
│
├── Database
│   └── StudentDB.sql
│
├── Program.cs
│
├── README.md
├── .gitignore
│
├── StudentManagementSystem.csproj
└── StudentManagementSystem.sln
</pre>

<hr>

<h2>✨ Features Summary</h2>

<ul>
<li>Add Student</li>
<li>Show Students</li>
<li>Delete Student</li>
<li>Database Integration</li>
</ul>

<hr>

<h2>📈 Learning Outcome</h2>

<p>Through this project, we learned how to:</p>

<ul>
<li>Build a structured console application</li>
<li>Apply OOP principles correctly</li>
<li>Connect C# with SQL Server using ADO.NET</li>
<li>Use Stored Procedures in applications</li>
<li>Read data from databases</li>
<li>Work in a collaborative development team</li>
</ul>

<hr>

<p align="center">
🚀 Built with passion while learning .NET
</p>
