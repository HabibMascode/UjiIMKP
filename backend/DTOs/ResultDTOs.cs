namespace backend.DTOs
{
    public class ResultListResponse
    {
        public int ExamId { get; set; }
        public int UserId { get; set; }
        public string ParticipantName { get; set; } = string.Empty;
        public string? NomorPekerja { get; set; }
        public int TotalQuestions { get; set; }
        public int CorrectAnswers { get; set; }
        public int WrongAnswers { get; set; }
        public double Score { get; set; }
        public DateTime? FinishedAt { get; set; }
    }

    public class ResultDetailResponse
    {
        public int ExamId { get; set; }
        public string ParticipantName { get; set; } = string.Empty;
        public double Score { get; set; }
        public int TotalQuestions { get; set; }
        public int CorrectAnswers { get; set; }
        public int WrongAnswers { get; set; }
        public DateTime StartedAt { get; set; }
        public DateTime? FinishedAt { get; set; }
        public List<ResultQuestionDetailDto> Details { get; set; } = new List<ResultQuestionDetailDto>();
    }

    public class ResultQuestionDetailDto
    {
        public string QuestionText { get; set; } = string.Empty;
        public string SelectedAnswer { get; set; } = string.Empty;
        public string CorrectAnswer { get; set; } = string.Empty;
        public bool IsCorrect { get; set; }
    }
}
