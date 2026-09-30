using System;
using System.Collections.Generic;

namespace backend.Models
{
    public class QuestionGroup
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public ICollection<Question> Questions { get; set; } = new List<Question>();
    }
}
