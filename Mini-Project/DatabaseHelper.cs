using Microsoft.Data.SqlClient;
using StudentManagementSystem.Models;
using System.Data;
using System.Diagnostics;


class DatabaseHelper
{
    private string connectionString = "Server=.;Database=StudentDB;Trusted_Connection=True;TrustServerCertificate=True;";
    public void AddStudentToDB(string name, int age, double grade)
	{
		try
		{
			using (SqlConnection connection = new SqlConnection(connectionString))
			{
				connection.Open();
				using (SqlCommand command = new SqlCommand("AddStudent", connection))
				{
					command.CommandType = CommandType.StoredProcedure;
					command.Parameters.AddWithValue("@St_Name", name);
					command.Parameters.AddWithValue("@Age", age);
					command.Parameters.AddWithValue("@Grade", grade);
					command.ExecuteNonQuery();
                    Console.ForegroundColor = ConsoleColor.Green;
                    Console.WriteLine("Student added successfully to the database. ");
                    Console.ResetColor();
				}
			}


		}
		catch (Exception ex)
		{
            Console.ForegroundColor = ConsoleColor.Red;
            Console.WriteLine($"An error occurred: {ex.Message}");
            Console.ResetColor();
        }
	}

	public List<Student> GetStudentsFromDB()
	{
		List<Student> students = new List<Student>();
		try
		{
			using (SqlConnection connection = new SqlConnection(connectionString))
			{
				connection.Open();
				string query = "SELECT * FROM view_Students";
				using (SqlCommand command = new SqlCommand(query, connection))
				{
					SqlDataReader reader = command.ExecuteReader();
					while (reader.Read())
					{
						string name = reader["St_Name"].ToString();
						int age = Convert.ToInt32(reader["Age"]);
						double grade = Convert.ToDouble(reader["Grade"]);
						students.Add(new Student(name, age, grade));
					}
				}
			}
		}
		catch (Exception ex)
		{
            Console.ForegroundColor = ConsoleColor.Red;
            Console.WriteLine($"An error occurred: {ex.Message}");
            Console.ResetColor();
        }

		return students;
	}

	public void DeleteStudentFromDB(string name)
	{
		try
		{
			using (SqlConnection connection = new SqlConnection(connectionString))
			{
				connection.Open();

				using (SqlCommand command = new SqlCommand("DeleteStudent", connection))
				{
					command.CommandType = CommandType.StoredProcedure;
					command.Parameters.AddWithValue("@St_Name", name);

					command.ExecuteNonQuery();
                    Console.ForegroundColor = ConsoleColor.Green;
                    Console.WriteLine("Student deleted successfully from the database.");
                    Console.ResetColor();
                   
				}
			}
		}
		catch (Exception ex)
		{
            Console.ForegroundColor = ConsoleColor.Red;
            Console.WriteLine($"An error occurred: {ex.Message}");
            Console.ResetColor();
            
           
		}
	}

}