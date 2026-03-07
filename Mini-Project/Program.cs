using StudentManagementSystem.Models;

class Program
{

    DatabaseHelper db = new DatabaseHelper();


    public static void ShowError(string message)
    {
        Console.ForegroundColor = ConsoleColor.Red;
        Console.WriteLine("\n-----------------------------------");
        Console.WriteLine("ERROR: " + message);
        Console.WriteLine("-----------------------------------");
        Console.ResetColor();
    }

    public static void PrintMenu()
    {
        List<Student> students = new List<Student>();

        while (true)
        {
            Console.Clear();

            Console.ForegroundColor = ConsoleColor.Cyan;
            Console.WriteLine("=========================================");
            Console.WriteLine("        STUDENT MANAGEMENT SYSTEM        ");
            Console.WriteLine("=========================================");
            Console.ResetColor();
            Console.WriteLine();
            Console.WriteLine("1) Add Student");
            Console.WriteLine("2) Show Students");
            Console.WriteLine("3) Delete Student");
            Console.WriteLine("4) Exit");
            Console.WriteLine();
            Console.Write("Select an option (1-4): ");

            if (int.TryParse(Console.ReadLine(), out int choice))
            {
                Console.Clear();

                switch (choice)
                {
                    case 1:
                        AddStudent(students);
                        break;

                    case 2:
                        ShowStudent(students);
                        break;

                    case 3:
                        DeleteStudent(students);
                        break;

                    case 4:
                        Console.ForegroundColor = ConsoleColor.Red;
                        Console.WriteLine("\nApplication Stopped Successfully.");
                        Console.ResetColor();
                        return;

                    default:
                        ShowError("Invalid choice. Please select from 1 to 4.");
                        break;
                }
            }
            else
            {
                ShowError("Invalid input. Please enter a number.");
            }

            Console.WriteLine("\nPress any key to return to menu...");
            Console.ReadKey();
        }
    }
    public static void AddStudent(List<Student> studentslist)
    {
        Console.Write("please enter the name of the student:");
        string? name = Console.ReadLine();
        if (!string.IsNullOrWhiteSpace(name))
        {
            int inputAge;
            while (true)
            {
                Console.Write("Please enter his age:");
                if (int.TryParse(Console.ReadLine(), out inputAge))
                {
                    if (inputAge <= 5)
                    {
                        ShowError("Age must be higher than 5 years old. Please try again.");
                        continue;
                    }
                    else if (inputAge > 120)
                    {
                        ShowError("Invalid age. Please enter a value between 5 and 120. Please try again.");
                        continue;
                    }
                    else
                        break;
                }
                else
                {
                    ShowError("invalid age input. Please try again ");
                    continue;
                }
            }
            double grade;
            while (true)
            {
                Console.Write("Please enter his grade:");
                if (double.TryParse(Console.ReadLine(), out grade))
                {
                    if (grade < 0 || grade > 100)
                    {
                        ShowError("Grade Can Be between 0 and 100! Please try again. ");
                        continue;
                    }
                    else
                        break;
                }
                else
                {
                    ShowError("invalid grade input. Please try again ");
                    continue;
                }
            }
            Student student = new Student(name, inputAge, grade);
            studentslist.Add(student);

            DatabaseHelper db = new DatabaseHelper();  //maryam
            db.AddStudentToDB(name, inputAge, grade);  //maryam

            
        }
        else
        {
            ShowError("Invalid name input. Please try again. ");
        }
    }
    public static void ShowStudent(List<Student> studentslist)
    {
        Console.ForegroundColor = ConsoleColor.Green;
        Console.WriteLine("============ STUDENT LIST ===========\n ");
        Console.ResetColor();

        DatabaseHelper db = new DatabaseHelper();  //maryam
        List<Student> studentsFromDB = db.GetStudentsFromDB();  //maryam
        //maryam
        //this one is the replacement of the one i commented out above.
        if (studentsFromDB.Count == 0)
        {
            ShowError("There are no students to display.");
            return;
        }

        foreach (Student s in studentsFromDB) //maryam
        {
            Console.ForegroundColor = ConsoleColor.Yellow;
            s.PrintInfo();
            Console.ResetColor();
            Console.WriteLine("----------------------------------------");
        }
    }

    public static void DeleteStudent(List<Student> studentslist)
    {
        DatabaseHelper db = new DatabaseHelper();

        while (true)
        {
            Console.Write("Please enter the name of the student: ");
            string? name = Console.ReadLine();

            if (string.IsNullOrWhiteSpace(name))
            {
                ShowError("Invalid input. Please enter a valid name.");
                continue;
            }

            List<Student> studentsFromDB = db.GetStudentsFromDB();

            var studentToDelete = studentsFromDB
                .FirstOrDefault(s => s.Name.Equals(name, StringComparison.OrdinalIgnoreCase));

            if (studentToDelete == null)
            {
                ShowError("Name not found. Please try again.");
                continue;
            }

            db.DeleteStudentFromDB(name);
            break;
        }
    }

    static void Main(string[] args)
    {
        PrintMenu();
    }
}