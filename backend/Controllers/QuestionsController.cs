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

        public QuestionsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public IActionResult GetQuestions()
        {
            var questions = _context.Questions.Select(q => new QuestionResponse
            {
                Id = q.Id,
                QuestionText = q.QuestionText,
                OptionA = q.OptionA,
                OptionB = q.OptionB,
                OptionC = q.OptionC,
                OptionD = q.OptionD,
                CorrectAnswer = q.CorrectAnswer,
                IsActive = q.IsActive,
                CreatedAt = q.CreatedAt,
                QuestionGroupId = q.QuestionGroupId,
                QuestionGroupName = q.QuestionGroup == null ? null : q.QuestionGroup.Name
            }).ToList();

            return Ok(questions);
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

            var question = new Question
            {
                QuestionText = request.QuestionText,
                OptionA = request.OptionA,
                OptionB = request.OptionB,
                OptionC = request.OptionC,
                OptionD = request.OptionD,
                CorrectAnswer = request.CorrectAnswer,
                IsActive = request.IsActive,
                QuestionGroupId = request.QuestionGroupId
            };

            if (request.QuestionGroupId.HasValue &&
                !_context.QuestionGroups.Any(g => g.Id == request.QuestionGroupId.Value))
                return BadRequest("Kelompok soal tidak ditemukan.");

            _context.Questions.Add(question);
            _context.SaveChanges();

            return Ok(new { message = "Soal berhasil dibuat." });
        }

        [HttpPut("{id}")]
        public IActionResult UpdateQuestion(int id, [FromBody] UpdateQuestionRequest request)
        {
            var question = _context.Questions.Find(id);
            if (question == null) return NotFound("Soal tidak ditemukan.");

            question.QuestionText = request.QuestionText;
            question.OptionA = request.OptionA;
            question.OptionB = request.OptionB;
            question.OptionC = request.OptionC;
            question.OptionD = request.OptionD;
            question.CorrectAnswer = request.CorrectAnswer;
            question.IsActive = request.IsActive;
            question.QuestionGroupId = request.QuestionGroupId;

            if (request.QuestionGroupId.HasValue &&
                !_context.QuestionGroups.Any(g => g.Id == request.QuestionGroupId.Value))
                return BadRequest("Kelompok soal tidak ditemukan.");

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

            _context.Questions.Remove(question);
            _context.SaveChanges();

            return Ok(new { message = "Soal berhasil dihapus." });
        }
    }
}
