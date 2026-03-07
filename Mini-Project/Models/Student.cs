namespace StudentManagementSystem.Models
{
    class Student
    {
        private string name;
        private int age;
        private double grade;
        public Student()
        {
            name = "Unknown";
            age = 0;
            grade = 0;
        }
        public Student(string name, int age, double grade)
        {
            this.name = name;
            this.age = age;
            this.grade = grade;
        }
        public string Name { get { return name; } }
        public int Age { get { return age; } }
        public double Grade { get { return grade; } }
        public void PrintInfo()
        {
            Console.WriteLine($"Name: {name} | Age: {age} | Grade: {grade}");
        }
    }
}