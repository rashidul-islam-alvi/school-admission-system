
using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc.Testing;

namespace SchoolAdmission.Tests;

public class ClassTests : IDisposable
{
    private readonly WebApplicationFactory<Program> _factory = new();

    private const string StudentId = "12345678901234567";

    private async Task<Guid> CreateClass(
        HttpClient client,
        string name,
        int seats)
    {
        var response = await client.PostAsJsonAsync(
            "/classes",
            new
            {
                name,
                totalSeats = seats
            });

        response.EnsureSuccessStatusCode();

        var result = await response.Content.ReadFromJsonAsync<JsonElement>();

        return result.GetProperty("id").GetGuid();
    }

    [Fact]
    public async Task AdmissionWorkflow_WorksCorrectly()
    {
        using var client = _factory.CreateClient();

        var classId = await CreateClass(
            client,
            $"Test Class {Guid.NewGuid()}",
            2);

        client.DefaultRequestHeaders.Add("X-Student-Id", StudentId);

        // Create hold
        var holdResponse = await client.PostAsync(
            $"/classes/{classId}/holds",
            null);

        Assert.Equal(HttpStatusCode.Created, holdResponse.StatusCode);

        var hold = await holdResponse.Content.ReadFromJsonAsync<JsonElement>();

        var holdId = hold.GetProperty("holdId").GetGuid();

        Assert.Equal("HELD", hold.GetProperty("status").GetString());

        // Duplicate application should fail
        var duplicateResponse = await client.PostAsync(
            $"/classes/{classId}/holds",
            null);

        Assert.Equal(HttpStatusCode.Conflict, duplicateResponse.StatusCode);

        // Confirm admission
        var confirmResponse = await client.PostAsync(
            $"/holds/{holdId}/confirm",
            null);

        Assert.Equal(HttpStatusCode.OK, confirmResponse.StatusCode);

        var confirmation = await confirmResponse.Content
            .ReadFromJsonAsync<JsonElement>();

        Assert.Equal(
            "CONFIRMED",
            confirmation.GetProperty("status").GetString());

        // Check class seat counts
        var classResponse = await client.GetAsync($"/classes/{classId}");

        classResponse.EnsureSuccessStatusCode();

        var classData = await classResponse.Content
            .ReadFromJsonAsync<JsonElement>();

        Assert.Equal(2, classData.GetProperty("totalSeats").GetInt32());
        Assert.Equal(1, classData.GetProperty("confirmedSeats").GetInt32());
        Assert.Equal(0, classData.GetProperty("heldSeats").GetInt32());
        Assert.Equal(1, classData.GetProperty("availableSeats").GetInt32());

        // Check student's applications
        var myHolds = await client.GetFromJsonAsync<JsonElement[]>("/me/holds");

        Assert.NotNull(myHolds);
        Assert.Contains(myHolds, h =>
            h.GetProperty("holdId").GetGuid() == holdId);
    }

    [Fact]
    public async Task ConcurrentApplications_NeverExceedAvailableSeats()
    {
        using var setupClient = _factory.CreateClient();

        var classId = await CreateClass(
            setupClient,
            $"Concurrency Test {Guid.NewGuid()}",
            1);

        const int numberOfStudents = 8;

        var tasks = Enumerable.Range(0, numberOfStudents)
            .Select(async i =>
            {
                using var client = _factory.CreateClient();

                using var request = new HttpRequestMessage(
                    HttpMethod.Post,
                    $"/classes/{classId}/holds");

                var studentId = (12345678901230000L + i)
                    .ToString("D17");

                request.Headers.Add("X-Student-Id", studentId);

                using var response = await client.SendAsync(request);

                return response.StatusCode;
            });

        var results = await Task.WhenAll(tasks);

        var successful = results.Count(
            status => status == HttpStatusCode.Created);

        var rejected = results.Count(
            status => status == HttpStatusCode.Conflict);

        Assert.Equal(1, successful);
        Assert.Equal(7, rejected);

        // Verify database-backed seat counts
        var classResponse = await setupClient.GetAsync(
            $"/classes/{classId}");

        classResponse.EnsureSuccessStatusCode();

        var classData = await classResponse.Content
            .ReadFromJsonAsync<JsonElement>();

        Assert.Equal(1, classData.GetProperty("totalSeats").GetInt32());
        Assert.Equal(1, classData.GetProperty("heldSeats").GetInt32());
        Assert.Equal(0, classData.GetProperty("confirmedSeats").GetInt32());
        Assert.Equal(0, classData.GetProperty("availableSeats").GetInt32());
    }

    [Fact]
    public async Task CreateHold_WithInvalidStudentId_ReturnsBadRequest()
    {
        using var client = _factory.CreateClient();

        var classId = await CreateClass(
            client,
            $"Validation Test {Guid.NewGuid()}",
            2);

        client.DefaultRequestHeaders.Add(
            "X-Student-Id",
            "12345");

        var response = await client.PostAsync(
            $"/classes/{classId}/holds",
            null);

        Assert.Equal(
            HttpStatusCode.BadRequest,
            response.StatusCode);
    }

    public void Dispose()
    {
        _factory.Dispose();
    }
}
