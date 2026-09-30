using System;
using System.Collections.Generic;

namespace backend.Models
{
    public class Exam
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public User? User { get; set; }
        public int TotalQuestions { get; set; }
        public int CorrectAnswers { get; set; }
        public int WrongAnswers { get; set; }
        public double Score { get; set; }
        public DateTime StartedAt { get; set; } = DateTime.UtcNow;
        public DateTime? FinishedAt { get; set; }

        public ICollection<ExamQuestion>? ExamQuestions { get; set; }
        public ICollection<ExamAnswer>? ExamAnswers { get; set; }
    }
}
