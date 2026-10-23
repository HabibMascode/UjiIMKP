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
    public class UsersController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public UsersController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public IActionResult GetUsers()
        {
            var users = _context.Users.Select(u => new UserResponse
            {
                Id = u.Id,
                Name = u.Name,
                Username = u.Username,
                Email = u.Email,
                Role = u.Role,
                NomorPekerja = u.NomorPekerja,
                IsActive = u.IsActive,
                CreatedAt = u.CreatedAt
            }).ToList();

            return Ok(users);
        }

        [HttpPost]
        public IActionResult CreateUser([FromBody] CreateUserRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Username) || string.IsNullOrWhiteSpace(request.Password))
                return BadRequest("Username dan Password tidak boleh kosong.");

            if (_context.Users.Any(u => u.Username == request.Username))
                return BadRequest("Username sudah digunakan.");

            if (_context.Users.Any(u => u.Email == request.Email))
                return BadRequest("Email sudah digunakan.");

            var user = new User
            {
                Name = request.Name,
                Username = request.Username,
                Email = request.Email,
                NomorPekerja = request.NomorPekerja,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
                Role = "Peserta",
                IsActive = request.IsActive
            };

            _context.Users.Add(user);
            _context.SaveChanges();

            return Ok(new { message = "User berhasil dibuat." });
        }

        [HttpPut("{id}")]
        public IActionResult UpdateUser(int id, [FromBody] UpdateUserRequest request)
        {
            var user = _context.Users.Find(id);
            if (user == null) return NotFound("User tidak ditemukan.");

            if (_context.Users.Any(u => u.Username == request.Username && u.Id != id))
                return BadRequest("Username sudah digunakan.");

            if (_context.Users.Any(u => u.Email == request.Email && u.Id != id))
                return BadRequest("Email sudah digunakan.");

            user.Name = request.Name;
            user.Username = request.Username;
            user.Email = request.Email;
            user.NomorPekerja = request.NomorPekerja;
            
            if (!string.IsNullOrWhiteSpace(request.Role))
            {
                user.Role = request.Role;
            }

            user.IsActive = request.IsActive;

            if (!string.IsNullOrWhiteSpace(request.Password))
            {
                user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);
            }

            _context.SaveChanges();

            return Ok(new { message = "User berhasil diupdate." });
        }

        [HttpDelete("{id}")]
        public IActionResult DeleteUser(int id)
        {
            var user = _context.Users.Find(id);
            if (user == null) return NotFound("User tidak ditemukan.");

            if (user.Role == "Admin")
                return BadRequest("User Admin tidak dapat dihapus.");

            var examIds = _context.Exams
                .Where(e => e.UserId == id)
                .Select(e => e.Id)
                .ToList();

            if (examIds.Count > 0)
            {
                _context.ExamAnswers.RemoveRange(
                    _context.ExamAnswers.Where(answer => examIds.Contains(answer.ExamId)));
                _context.ExamQuestions.RemoveRange(
                    _context.ExamQuestions.Where(question => examIds.Contains(question.ExamId)));
                _context.Exams.RemoveRange(
                    _context.Exams.Where(exam => examIds.Contains(exam.Id)));
            }

            _context.Users.Remove(user);
            _context.SaveChanges();

            return Ok(new { message = "User dan seluruh riwayat ujiannya berhasil dihapus." });
        }
    }
}
