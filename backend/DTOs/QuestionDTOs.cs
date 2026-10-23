namespace backend.DTOs
{
    public class CreateQuestionRequest
    {
        public string QuestionText { get; set; } = string.Empty;
        public string OptionA { get; set; } = string.Empty;
        public string OptionB { get; set; } = string.Empty;
        public string OptionC { get; set; } = string.Empty;
        public string OptionD { get; set; } = string.Empty;
        public string CorrectAnswer { get; set; } = string.Empty;
        public string? ImageUrl { get; set; }
        public bool IsActive { get; set; } = true;
        public int? QuestionGroupId { get; set; }
    }

    public class UpdateQuestionRequest : CreateQuestionRequest
    {
    }

    public class QuestionResponse : CreateQuestionRequest
    {
        public int Id { get; set; }
        public DateTime CreatedAt { get; set; }
        public string? QuestionGroupName { get; set; }
    }

    public class CreateQuestionGroupRequest
    {
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public bool IsActive { get; set; } = true;
        public List<CreateQuestionRequest>? Questions { get; set; }
    }

    public class UpdateQuestionGroupRequest : CreateQuestionGroupRequest
    {
    }

    public class QuestionGroupSummaryResponse
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public int QuestionCount { get; set; }
        public int ActiveQuestionCount { get; set; }
    }

    public class QuestionGroupDetailResponse : QuestionGroupSummaryResponse
    {
        public List<QuestionResponse> Questions { get; set; } = new();
    }
}
