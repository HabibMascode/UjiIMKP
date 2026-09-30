using backend.Data;
using backend.DTOs;
using backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class SettingsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public SettingsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("exam-count")]
        public IActionResult GetExamQuestionCount()
        {
            var setting = _context.SystemSettings.FirstOrDefault(s => s.Key == "ExamQuestionCount");
            int count = _context.Questions.Count(q => q.IsActive &&
                q.QuestionGroupId.HasValue && q.QuestionGroup!.IsActive);
            if (setting != null && int.TryParse(setting.Value, out int val))
            {
                count = val;
            }
            return Ok(new ExamSettingsResponse { TotalQuestionsForExam = count });
        }

        [HttpPut("exam-count")]
        public IActionResult UpdateExamQuestionCount([FromBody] UpdateExamSettingsRequest request)
        {
            if (request.TotalQuestionsForExam <= 0)
                return BadRequest("Jumlah soal harus lebih dari 0.");

            var activeQuestionsCount = _context.Questions.Count(q => q.IsActive &&
                q.QuestionGroupId.HasValue && q.QuestionGroup!.IsActive);
            if (request.TotalQuestionsForExam > activeQuestionsCount)
                return BadRequest($"Jumlah soal yang diminta ({request.TotalQuestionsForExam}) melebihi jumlah soal aktif yang tersedia ({activeQuestionsCount}).");

            var setting = _context.SystemSettings.FirstOrDefault(s => s.Key == "ExamQuestionCount");
            if (setting == null)
            {
                setting = new SystemSetting { Key = "ExamQuestionCount", Value = request.TotalQuestionsForExam.ToString() };
                _context.SystemSettings.Add(setting);
            }
            else
            {
                setting.Value = request.TotalQuestionsForExam.ToString();
            }

            _context.SaveChanges();
            return Ok(new { message = "Pengaturan stok soal ujian berhasil disimpan." });
        }
    }
}
