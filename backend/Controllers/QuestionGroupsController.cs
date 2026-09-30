using backend.Data;
using backend.DTOs;
using backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace backend.Controllers
{
    [Route("api/questiongroups")]
    [Route("api/question-groups")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class QuestionGroupsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public QuestionGroupsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public IActionResult GetGroups()
        {
            return Ok(_context.QuestionGroups
                .AsNoTracking()
                .Select(g => new QuestionGroupSummaryResponse
                {
                    Id = g.Id,
                    Name = g.Name,
                    Description = g.Description,
                    IsActive = g.IsActive,
                    CreatedAt = g.CreatedAt,
                    QuestionCount = g.Questions.Count(),
                    ActiveQuestionCount = g.Questions.Count(q => q.IsActive)
                })
                .OrderBy(g => g.Name)
                .ToList());
        }

        [HttpGet("{id:int}")]
        public IActionResult GetGroup(int id)
        {
            var group = _context.QuestionGroups
                .AsNoTracking()
                .Include(g => g.Questions)
                .FirstOrDefault(g => g.Id == id);
            return group == null ? NotFound("Kelompok soal tidak ditemukan.") : Ok(ToDetail(group));
        }

        [HttpPost]
        public IActionResult CreateGroup([FromBody] CreateQuestionGroupRequest request)
        {
            if (!ValidateGroup(request.Name, out var error))
                return BadRequest(error);
            if (!ValidateQuestions(request.Questions ?? new List<CreateQuestionRequest>(), out error))
                return BadRequest(error);

            var group = new QuestionGroup
            {
                Name = request.Name.Trim(),
                Description = request.Description?.Trim() ?? string.Empty,
                IsActive = request.IsActive,
                Questions = (request.Questions ?? new List<CreateQuestionRequest>()).Select(q => ToQuestion(q)).ToList()
            };
            _context.QuestionGroups.Add(group);
            _context.SaveChanges();
            return CreatedAtAction(nameof(GetGroup), new { id = group.Id }, ToDetail(group));
        }

        [HttpPut("{id:int}")]
        public IActionResult UpdateGroup(int id, [FromBody] UpdateQuestionGroupRequest request)
        {
            var group = _context.QuestionGroups.Include(g => g.Questions).FirstOrDefault(g => g.Id == id);
            if (group == null) return NotFound("Kelompok soal tidak ditemukan.");
            if (!ValidateGroup(request.Name, out var error))
                return BadRequest(error);
            if (request.Questions != null && !ValidateQuestions(request.Questions, out error))
                return BadRequest(error);

            group.Name = request.Name.Trim();
            group.Description = request.Description?.Trim() ?? string.Empty;
            group.IsActive = request.IsActive;
            if (request.Questions != null)
            {
                _context.Questions.RemoveRange(group.Questions);
                group.Questions = request.Questions.Select(q => ToQuestion(q)).ToList();
            }
            _context.SaveChanges();
            return Ok(ToDetail(group));
        }

        [HttpPatch("{id:int}/status")]
        [HttpPut("{id:int}/status")]
        public IActionResult UpdateStatus(int id, [FromBody] UpdateQuestionGroupStatusRequest request)
        {
            var group = _context.QuestionGroups.Find(id);
            if (group == null) return NotFound("Kelompok soal tidak ditemukan.");
            group.IsActive = request.IsActive;
            _context.SaveChanges();
            return Ok(new { id = group.Id, isActive = group.IsActive });
        }

        [HttpDelete("{id:int}")]
        public IActionResult DeleteGroup(int id)
        {
            var group = _context.QuestionGroups.Include(g => g.Questions).FirstOrDefault(g => g.Id == id);
            if (group == null) return NotFound("Kelompok soal tidak ditemukan.");
            var questionIds = group.Questions.Select(q => q.Id).ToList();
            if (_context.ExamQuestions.Any(eq => questionIds.Contains(eq.QuestionId)) ||
                _context.ExamAnswers.Any(ea => questionIds.Contains(ea.QuestionId)))
                return BadRequest("Kelompok soal tidak dapat dihapus karena sudah digunakan dalam ujian.");

            _context.QuestionGroups.Remove(group);
            _context.SaveChanges();
            return Ok(new { message = "Kelompok soal dan seluruh soalnya berhasil dihapus." });
        }

        [HttpPost("import")]
        [HttpPost("import-json")]
        public IActionResult ImportGroup([FromBody] JsonElement payload)
        {
            try
            {
                var request = payload.Deserialize<QuestionGroupImportRequest>();
                if (request == null || string.IsNullOrWhiteSpace(request.GroupName))
                    return BadRequest("JSON import wajib memiliki nama_kelompok.");
                var questions = request.Soal ?? request.Questions ?? new List<ImportedQuestionRequest>();
                var questionRequests = questions.Select(ToCreateQuestionRequest).ToList();
                if (!ValidateQuestions(questionRequests, out var error))
                    return BadRequest(error);

                var group = new QuestionGroup
                {
                    Name = request.GroupName.Trim(),
                    Description = request.Description?.Trim() ?? string.Empty,
                    IsActive = false,
                    Questions = questionRequests.Select(q => ToQuestion(q)).ToList()
                };

                _context.QuestionGroups.Add(group);
                _context.SaveChanges();
                return Ok(new { id = group.Id, imported = group.Questions.Count, message = "Grup soal berhasil diimpor." });
            }
            catch (JsonException)
            {
                return BadRequest("Format JSON import tidak valid.");
            }
        }

        [HttpPost("{id:int}/import")]
        [HttpPost("{id:int}/import-json")]
        public IActionResult Import(int id, [FromBody] JsonElement payload)
        {
            var group = _context.QuestionGroups.Find(id);
            if (group == null) return NotFound("Kelompok soal tidak ditemukan.");

            try
            {
                var requests = payload.ValueKind == JsonValueKind.Array
                    ? payload.Deserialize<List<CreateQuestionRequest>>()
                    : payload.Deserialize<QuestionImportRequest>()?.Questions;
                if (requests == null || requests.Count == 0)
                    return BadRequest("JSON import harus berisi minimal satu soal.");
                if (!ValidateQuestions(requests, out var error))
                    return BadRequest(error);
                foreach (var request in requests)
                    _context.Questions.Add(ToQuestion(request, id));
                _context.SaveChanges();
                return Ok(new { imported = requests.Count });
            }
            catch (JsonException)
            {
                return BadRequest("Format JSON import tidak valid.");
            }
        }

        private static bool ValidateGroup(string name, out string error)
        {
            error = string.Empty;
            if (string.IsNullOrWhiteSpace(name))
            {
                error = "Nama kelompok soal harus diisi.";
                return false;
            }
            return true;
        }

        private static bool ValidateQuestions(IEnumerable<CreateQuestionRequest> questions, out string error)
        {
            var list = questions.ToList();
            error = string.Empty;
            if (list.Any(q => string.IsNullOrWhiteSpace(q.QuestionText) ||
                string.IsNullOrWhiteSpace(q.OptionA) || string.IsNullOrWhiteSpace(q.OptionB) ||
                string.IsNullOrWhiteSpace(q.OptionC) || string.IsNullOrWhiteSpace(q.OptionD) ||
                !new[] { "A", "B", "C", "D" }.Contains(q.CorrectAnswer.Trim().ToUpperInvariant())))
            {
                error = "Setiap soal harus memiliki pertanyaan, empat pilihan, dan jawaban benar A-D.";
                return false;
            }
            return true;
        }

        private static Question ToQuestion(CreateQuestionRequest request, int? groupId = null) => new()
        {
            QuestionText = request.QuestionText.Trim(),
            OptionA = request.OptionA.Trim(),
            OptionB = request.OptionB.Trim(),
            OptionC = request.OptionC.Trim(),
            OptionD = request.OptionD.Trim(),
            CorrectAnswer = request.CorrectAnswer.Trim().ToUpperInvariant(),
            IsActive = request.IsActive,
            QuestionGroupId = groupId
        };

        private static CreateQuestionRequest ToCreateQuestionRequest(ImportedQuestionRequest request) => new()
        {
            QuestionText = request.QuestionText,
            OptionA = request.OptionA,
            OptionB = request.OptionB,
            OptionC = request.OptionC,
            OptionD = request.OptionD,
            CorrectAnswer = request.CorrectAnswer,
            IsActive = true
        };

        private static QuestionGroupSummaryResponse ToSummary(QuestionGroup group) => new()
        {
            Id = group.Id, Name = group.Name, Description = group.Description,
            IsActive = group.IsActive, CreatedAt = group.CreatedAt,
            QuestionCount = group.Questions.Count, ActiveQuestionCount = group.Questions.Count(q => q.IsActive)
        };

        private static QuestionGroupDetailResponse ToDetail(QuestionGroup group) => new()
        {
            Id = group.Id, Name = group.Name, Description = group.Description,
            IsActive = group.IsActive, CreatedAt = group.CreatedAt,
            QuestionCount = group.Questions.Count, ActiveQuestionCount = group.Questions.Count(q => q.IsActive),
            Questions = group.Questions.Select(q => new QuestionResponse
            {
                Id = q.Id, QuestionText = q.QuestionText, OptionA = q.OptionA, OptionB = q.OptionB,
                OptionC = q.OptionC, OptionD = q.OptionD, CorrectAnswer = q.CorrectAnswer,
                IsActive = q.IsActive, CreatedAt = q.CreatedAt, QuestionGroupId = q.QuestionGroupId,
                QuestionGroupName = group.Name
            }).ToList()
        };
    }

    public class UpdateQuestionGroupStatusRequest
    {
        public bool IsActive { get; set; }
    }

    public class QuestionImportRequest
    {
        [JsonPropertyName("soal")]
        public List<CreateQuestionRequest> Questions { get; set; } = new();
    }

    public class QuestionGroupImportRequest
    {
        [JsonPropertyName("nama_kelompok")]
        public string? ImportedName { get; set; }

        [JsonPropertyName("name")]
        public string? AlternativeName { get; set; }

        [JsonPropertyName("description")]
        public string? Description { get; set; }

        [JsonPropertyName("soal")]
        public List<ImportedQuestionRequest>? Soal { get; set; }

        [JsonPropertyName("questions")]
        public List<ImportedQuestionRequest>? Questions { get; set; }

        [JsonIgnore]
        public string GroupName => ImportedName ?? AlternativeName ?? string.Empty;
    }

    public class ImportedQuestionRequest
    {
        [JsonPropertyName("pertanyaan")]
        public string QuestionText { get; set; } = string.Empty;

        [JsonPropertyName("pilihan_a")]
        public string OptionA { get; set; } = string.Empty;

        [JsonPropertyName("pilihan_b")]
        public string OptionB { get; set; } = string.Empty;

        [JsonPropertyName("pilihan_c")]
        public string OptionC { get; set; } = string.Empty;

        [JsonPropertyName("pilihan_d")]
        public string OptionD { get; set; } = string.Empty;

        [JsonPropertyName("jawaban_benar")]
        public string CorrectAnswer { get; set; } = string.Empty;
    }
}
