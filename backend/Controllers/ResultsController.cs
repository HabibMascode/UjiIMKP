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
                    ParticipantName = e.User!.Name,
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
    }
}
