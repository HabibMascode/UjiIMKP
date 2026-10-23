using backend.Data;
using backend.DTOs;
using backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class QuestionsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IWebHostEnvironment _env;

        public QuestionsController(ApplicationDbContext context, IWebHostEnvironment env)
        {
            _context = context;
            _env = env;
        }

        [HttpGet]
        public IActionResult GetQuestions([FromQuery] int? groupId)
        {
            var query = _context.Questions
                .Include(q => q.QuestionGroup)
                .AsQueryable();

            if (groupId.HasValue)
                query = query.Where(q => q.QuestionGroupId == groupId);

            var questions = query.Select(q => new QuestionResponse
            {
                Id = q.Id,
                QuestionText = q.QuestionText,
                OptionA = q.OptionA,
                OptionB = q.OptionB,
                OptionC = q.OptionC,
                OptionD = q.OptionD,
                CorrectAnswer = q.CorrectAnswer,
                ImageUrl = q.ImageUrl,
                IsActive = q.IsActive,
                CreatedAt = q.CreatedAt,
                QuestionGroupId = q.QuestionGroupId,
                QuestionGroupName = q.QuestionGroup == null ? null : q.QuestionGroup.Name
            }).ToList();

            return Ok(questions);
        }

        [HttpGet("{id}")]
        public IActionResult GetQuestion(int id)
        {
            var q = _context.Questions
                .Include(q => q.QuestionGroup)
                .FirstOrDefault(q => q.Id == id);
            if (q == null) return NotFound("Soal tidak ditemukan.");
            return Ok(new QuestionResponse
            {
                Id = q.Id,
                QuestionText = q.QuestionText,
                OptionA = q.OptionA,
                OptionB = q.OptionB,
                OptionC = q.OptionC,
                OptionD = q.OptionD,
                CorrectAnswer = q.CorrectAnswer,
                ImageUrl = q.ImageUrl,
                IsActive = q.IsActive,
                CreatedAt = q.CreatedAt,
                QuestionGroupId = q.QuestionGroupId,
                QuestionGroupName = q.QuestionGroup?.Name
            });
        }

        [HttpPost]
        public IActionResult CreateQuestion([FromBody] CreateQuestionRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.QuestionText) ||
                string.IsNullOrWhiteSpace(request.OptionA) || string.IsNullOrWhiteSpace(request.OptionB) ||
                string.IsNullOrWhiteSpace(request.OptionC) || string.IsNullOrWhiteSpace(request.OptionD) ||
                string.IsNullOrWhiteSpace(request.CorrectAnswer))
            {
                return BadRequest("Semua field pertanyaan dan pilihan harus diisi.");
            }

            if (request.QuestionGroupId.HasValue &&
                !_context.QuestionGroups.Any(g => g.Id == request.QuestionGroupId.Value))
                return BadRequest("Kelompok soal tidak ditemukan.");

            var question = new Question
            {
                QuestionText = request.QuestionText,
                OptionA = request.OptionA,
                OptionB = request.OptionB,
                OptionC = request.OptionC,
                OptionD = request.OptionD,
                CorrectAnswer = request.CorrectAnswer,
                ImageUrl = request.ImageUrl,
                IsActive = request.IsActive,
                QuestionGroupId = request.QuestionGroupId
            };

            _context.Questions.Add(question);
            _context.SaveChanges();

            return Ok(new { message = "Soal berhasil dibuat.", id = question.Id });
        }

        [HttpPut("{id}")]
        public IActionResult UpdateQuestion(int id, [FromBody] UpdateQuestionRequest request)
        {
            var question = _context.Questions.Find(id);
            if (question == null) return NotFound("Soal tidak ditemukan.");

            if (request.QuestionGroupId.HasValue &&
                !_context.QuestionGroups.Any(g => g.Id == request.QuestionGroupId.Value))
                return BadRequest("Kelompok soal tidak ditemukan.");

            question.QuestionText = request.QuestionText;
            question.OptionA = request.OptionA;
            question.OptionB = request.OptionB;
            question.OptionC = request.OptionC;
            question.OptionD = request.OptionD;
            question.CorrectAnswer = request.CorrectAnswer;
            question.ImageUrl = request.ImageUrl;
            question.IsActive = request.IsActive;
            question.QuestionGroupId = request.QuestionGroupId;

            _context.SaveChanges();

            return Ok(new { message = "Soal berhasil diupdate." });
        }

        [HttpDelete("{id}")]
        public IActionResult DeleteQuestion(int id)
        {
            var question = _context.Questions.Find(id);
            if (question == null) return NotFound("Soal tidak ditemukan.");

            if (_context.ExamQuestions.Any(eq => eq.QuestionId == id) ||
                _context.ExamAnswers.Any(ea => ea.QuestionId == id))
            {
                return BadRequest("Soal tidak dapat dihapus karena sudah digunakan dalam ujian.");
            }

            // Delete image file if exists
            if (!string.IsNullOrEmpty(question.ImageUrl))
            {
                var filePath = Path.Combine(_env.WebRootPath ?? "wwwroot", question.ImageUrl.TrimStart('/'));
                if (System.IO.File.Exists(filePath))
                    System.IO.File.Delete(filePath);
            }

            _context.Questions.Remove(question);
            _context.SaveChanges();

            return Ok(new { message = "Soal berhasil dihapus." });
        }

        [HttpPost("upload-image")]
        public async Task<IActionResult> UploadImage(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("File gambar tidak ditemukan.");

            var allowedTypes = new[] { "image/jpeg", "image/png", "image/gif", "image/webp" };
            if (!allowedTypes.Contains(file.ContentType.ToLower()))
                return BadRequest("Format file tidak didukung. Gunakan JPG, PNG, GIF, atau WebP.");

            if (file.Length > 5 * 1024 * 1024) // 5MB max
                return BadRequest("Ukuran file maksimal 5MB.");

            var uploadsDir = Path.Combine(_env.WebRootPath ?? "wwwroot", "uploads", "questions");
            Directory.CreateDirectory(uploadsDir);

            var ext = Path.GetExtension(file.FileName);
            var fileName = $"{Guid.NewGuid()}{ext}";
            var fullPath = Path.Combine(uploadsDir, fileName);

            using var stream = new FileStream(fullPath, FileMode.Create);
            await file.CopyToAsync(stream);

            var url = $"/uploads/questions/{fileName}";
            return Ok(new { url });
        }
    }
}
