namespace backend.DTOs
{
    public class ExamQuestionDto
    {
        public int Id { get; set; }
        public string QuestionText { get; set; } = string.Empty;
        public string OptionA { get; set; } = string.Empty;
        public string OptionB { get; set; } = string.Empty;
        public string OptionC { get; set; } = string.Empty;
        public string OptionD { get; set; } = string.Empty;
    }

    public class StartExamResponse
    {
        public int ExamId { get; set; }
        public List<ExamQuestionDto> Questions { get; set; } = new List<ExamQuestionDto>();
    }

    public class SubmitExamAnswerDto
    {
        public int QuestionId { get; set; }
        public string SelectedAnswer { get; set; } = string.Empty;
    }

    public class SubmitExamRequest
    {
        public List<SubmitExamAnswerDto> Answers { get; set; } = new List<SubmitExamAnswerDto>();
    }

    public class ExamResultResponse
    {
        public int ExamId { get; set; }
        public int TotalQuestions { get; set; }
        public int CorrectAnswers { get; set; }
        public int WrongAnswers { get; set; }
        public double Score { get; set; }
        public DateTime StartedAt { get; set; }
        public DateTime? FinishedAt { get; set; }
    }
}
