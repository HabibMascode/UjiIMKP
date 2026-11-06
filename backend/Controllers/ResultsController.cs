using backend.Data;
using backend.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class ResultsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ResultsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public IActionResult GetAllResults()
        {
            var results = _context.Exams
                .Include(e => e.User)
                .Where(e => e.FinishedAt != null)
                .Select(e => new ResultListResponse
                {
                    ExamId = e.Id,
                    UserId = e.UserId,
                    ParticipantName = e.User!.Name,
                    NomorPekerja = e.User.NomorPekerja,
                    TotalQuestions = e.TotalQuestions,
                    CorrectAnswers = e.CorrectAnswers,
                    WrongAnswers = e.WrongAnswers,
                    Score = e.Score,
                    FinishedAt = e.FinishedAt
                })
                .OrderByDescending(r => r.FinishedAt)
                .ToList();

            return Ok(results);
        }

        [HttpGet("{id}")]
        public IActionResult GetResultDetail(int id)
        {
            var exam = _context.Exams
                .Include(e => e.User)
                .Include(e => e.ExamAnswers)!.ThenInclude(ea => ea.Question)
                .FirstOrDefault(e => e.Id == id);

            if (exam == null) return NotFound("Ujian tidak ditemukan.");

            var response = new ResultDetailResponse
            {
                ExamId = exam.Id,
                ParticipantName = exam.User?.Name ?? "Unknown",
                Score = exam.Score,
                TotalQuestions = exam.TotalQuestions,
                CorrectAnswers = exam.CorrectAnswers,
                WrongAnswers = exam.WrongAnswers,
                StartedAt = exam.StartedAt,
                FinishedAt = exam.FinishedAt,
                Details = exam.ExamAnswers?.Select(ea => new ResultQuestionDetailDto
                {
                    QuestionText = ea.Question?.QuestionText ?? "",
                    SelectedAnswer = ea.SelectedAnswer,
                    CorrectAnswer = ea.Question?.CorrectAnswer ?? "",
                    IsCorrect = ea.IsCorrect
                }).ToList() ?? new List<ResultQuestionDetailDto>()
            };

            return Ok(response);
        }

        [HttpDelete("{id}")]
        public IActionResult DeleteResult(int id)
        {
            var exam = _context.Exams
                .Include(e => e.ExamAnswers)
                .FirstOrDefault(e => e.Id == id);

            if (exam == null) return NotFound("Hasil ujian tidak ditemukan.");

            // Remove related exam answers first
            if (exam.ExamAnswers != null && exam.ExamAnswers.Any())
            {
                _context.ExamAnswers.RemoveRange(exam.ExamAnswers);
            }

            _context.Exams.Remove(exam);
            _context.SaveChanges();

            return Ok(new { message = "Hasil ujian berhasil dihapus." });
        }
    }
}
