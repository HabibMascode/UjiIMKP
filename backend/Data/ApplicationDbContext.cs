using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Question> Questions { get; set; }
        public DbSet<QuestionGroup> QuestionGroups { get; set; }
        public DbSet<Exam> Exams { get; set; }
        public DbSet<ExamQuestion> ExamQuestions { get; set; }
        public DbSet<ExamAnswer> ExamAnswers { get; set; }
        public DbSet<SystemSetting> SystemSettings { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure Exam - User relation
            modelBuilder.Entity<Exam>()
                .HasOne(e => e.User)
                .WithMany(u => u.Exams)
                .HasForeignKey(e => e.UserId);

            modelBuilder.Entity<QuestionGroup>()
                .HasMany(g => g.Questions)
                .WithOne(q => q.QuestionGroup)
                .HasForeignKey(q => q.QuestionGroupId)
                .OnDelete(DeleteBehavior.Cascade);

            // Configure ExamQuestion relation
            modelBuilder.Entity<ExamQuestion>()
                .HasOne(eq => eq.Exam)
                .WithMany(e => e.ExamQuestions)
                .HasForeignKey(eq => eq.ExamId);

            modelBuilder.Entity<ExamQuestion>()
                .HasOne(eq => eq.Question)
                .WithMany()
                .HasForeignKey(eq => eq.QuestionId)
                .OnDelete(DeleteBehavior.Restrict);

            // Configure ExamAnswer relation
            modelBuilder.Entity<ExamAnswer>()
                .HasOne(ea => ea.Exam)
                .WithMany(e => e.ExamAnswers)
                .HasForeignKey(ea => ea.ExamId);

            modelBuilder.Entity<ExamAnswer>()
                .HasOne(ea => ea.Question)
                .WithMany()
                .HasForeignKey(ea => ea.QuestionId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
