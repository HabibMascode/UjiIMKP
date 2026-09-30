namespace backend.Models
{
    public class ExamAnswer
    {
        public int Id { get; set; }
        public int ExamId { get; set; }
        public Exam? Exam { get; set; }
        
        public int QuestionId { get; set; }
        public Question? Question { get; set; }

        public string SelectedAnswer { get; set; } = string.Empty;
        public bool IsCorrect { get; set; }
    }
}
