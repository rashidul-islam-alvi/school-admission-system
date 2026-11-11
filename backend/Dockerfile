# Build stage
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build

WORKDIR /src

COPY SchoolAdmission.Api/SchoolAdmission.Api.csproj SchoolAdmission.Api/

RUN dotnet restore SchoolAdmission.Api/SchoolAdmission.Api.csproj

COPY SchoolAdmission.Api/ SchoolAdmission.Api/

WORKDIR /src/SchoolAdmission.Api

RUN dotnet publish SchoolAdmission.Api.csproj \
    -c Release \
    -o /app/publish \
    /p:UseAppHost=false

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final

WORKDIR /app

ENV ASPNETCORE_HTTP_PORTS=8080
ENV ASPNETCORE_ENVIRONMENT=Production

EXPOSE 8080

COPY --from=build /app/publish .

ENTRYPOINT ["dotnet", "SchoolAdmission.Api.dll"]