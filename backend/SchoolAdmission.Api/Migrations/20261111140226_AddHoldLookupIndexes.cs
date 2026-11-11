using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SchoolAdmission.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddHoldLookupIndexes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_AdmissionHolds_ClassId_Status_ExpiresAtUtc",
                table: "AdmissionHolds",
                columns: new[] { "ClassId", "Status", "ExpiresAtUtc" });

            migrationBuilder.CreateIndex(
                name: "IX_AdmissionHolds_StudentId",
                table: "AdmissionHolds",
                column: "StudentId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_AdmissionHolds_ClassId_Status_ExpiresAtUtc",
                table: "AdmissionHolds");

            migrationBuilder.DropIndex(
                name: "IX_AdmissionHolds_StudentId",
                table: "AdmissionHolds");
        }
    }
}
