using backend.Data;
using backend.DTOs;
using backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ExamsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ExamsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpPost("start")]
        [Authorize(Roles = "Peserta")]
        public IActionResult StartExam()
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdStr, out int userId))
                return Unauthorized();

            // An exam is composed from the currently active, configured groups.
            var randomQuestions = _context.Questions
                .Where(q => q.IsActive && q.QuestionGroupId.HasValue && q.QuestionGroup!.IsActive)
                .OrderBy(r => Guid.NewGuid())
                .ToList();

            if (randomQuestions.Count == 0)
                return BadRequest("Tidak ada soal aktif dalam kelompok soal yang aktif.");

            var exam = new Exam
            {
                UserId = userId,
                TotalQuestions = randomQuestions.Count,
                StartedAt = DateTime.UtcNow
            };

            _context.Exams.Add(exam);
            _context.SaveChanges();

            foreach (var q in randomQuestions)
            {
                _context.ExamQuestions.Add(new ExamQuestion
                {
                    ExamId = exam.Id,
                    QuestionId = q.Id
                });
            }
            _context.SaveChanges();

            var response = new StartExamResponse
            {
                ExamId = exam.Id,
                Questions = randomQuestions.Select(q => new ExamQuestionDto
                {
                    Id = q.Id,
                    QuestionText = q.QuestionText,
                    OptionA = q.OptionA,
                    OptionB = q.OptionB,
                    OptionC = q.OptionC,
                    OptionD = q.OptionD
                }).ToList()
            };

            return Ok(response);
        }

        [HttpPost("{id}/submit")]
        [Authorize(Roles = "Peserta")]
        public IActionResult SubmitExam(int id, [FromBody] SubmitExamRequest request)
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdStr, out int userId))
                return Unauthorized();

            var exam = _context.Exams.Include(e => e.ExamQuestions).FirstOrDefault(e => e.Id == id && e.UserId == userId);
            if (exam == null) return NotFound("Ujian tidak ditemukan.");

            if (exam.FinishedAt.HasValue) return BadRequest("Ujian sudah disubmit sebelumnya.");

            int correctAnswers = 0;
            int wrongAnswers = 0;

            var examQuestionsIds = exam.ExamQuestions?.Select(eq => eq.QuestionId).ToList() ?? new List<int>();
            var questions = _context.Questions.Where(q => examQuestionsIds.Contains(q.Id)).ToList();

            foreach (var answer in request.Answers)
            {
                var question = questions.FirstOrDefault(q => q.Id == answer.QuestionId);
                if (question != null)
                {
                    bool isCorrect = question.CorrectAnswer.Equals(answer.SelectedAnswer, StringComparison.OrdinalIgnoreCase);
                    if (isCorrect) correctAnswers++; else wrongAnswers++;

                    _context.ExamAnswers.Add(new ExamAnswer
                    {
                        ExamId = exam.Id,
                        QuestionId = question.Id,
                        SelectedAnswer = answer.SelectedAnswer,
                        IsCorrect = isCorrect
                    });
                }
            }

            // Unanswered questions
            int unanswered = exam.TotalQuestions - (correctAnswers + wrongAnswers);
            wrongAnswers += unanswered;

            exam.CorrectAnswers = correctAnswers;
            exam.WrongAnswers = wrongAnswers;
            exam.Score = Math.Round(((double)correctAnswers / exam.TotalQuestions) * 100, 2);
            exam.FinishedAt = DateTime.UtcNow;

            _context.SaveChanges();

            return Ok(new ExamResultResponse
            {
                ExamId = exam.Id,
                TotalQuestions = exam.TotalQuestions,
                CorrectAnswers = exam.CorrectAnswers,
                WrongAnswers = exam.WrongAnswers,
                Score = exam.Score,
                StartedAt = exam.StartedAt,
                FinishedAt = exam.FinishedAt
            });
        }

        [HttpGet("{id}/result")]
        [Authorize(Roles = "Peserta")]
        public IActionResult GetMyResult(int id)
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdStr, out int userId))
                return Unauthorized();

            var exam = _context.Exams.FirstOrDefault(e => e.Id == id && e.UserId == userId);
            if (exam == null || !exam.FinishedAt.HasValue) return NotFound("Hasil ujian tidak ditemukan.");

            return Ok(new ExamResultResponse
            {
                ExamId = exam.Id,
                TotalQuestions = exam.TotalQuestions,
                CorrectAnswers = exam.CorrectAnswers,
                WrongAnswers = exam.WrongAnswers,
                Score = exam.Score,
                StartedAt = exam.StartedAt,
                FinishedAt = exam.FinishedAt
            });
        }
    }
}
