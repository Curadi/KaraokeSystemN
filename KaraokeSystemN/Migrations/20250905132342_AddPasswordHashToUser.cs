using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace KaraokeSystemN.Migrations
{
    /// <inheritdoc />
    public partial class AddPasswordHashToUser : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "HashedPassword",
                table: "users");

            migrationBuilder.RenameColumn(
                name: "Role",
                table: "users",
                newName: "PasswordHash");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "PasswordHash",
                table: "users",
                newName: "Role");

            migrationBuilder.AddColumn<string>(
                name: "HashedPassword",
                table: "users",
                type: "text",
                nullable: false,
                defaultValue: "");
        }
    }
}
