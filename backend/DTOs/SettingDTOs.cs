namespace backend.DTOs
{
    public class ExamSettingsResponse
    {
        public int TotalQuestionsForExam { get; set; }
    }
    
    public class UpdateExamSettingsRequest
    {
        public int TotalQuestionsForExam { get; set; }
    }
}
