FROM maven:3.9.9-eclipse-temurin-21 AS build
WORKDIR /app

COPY pom.xml .
RUN mvn -B -DskipTests dependency:go-offline

COPY src ./src
RUN mvn -B -DskipTests package

FROM eclipse-temurin:21-jre
WORKDIR /app

# Create logs directory for logging
RUN mkdir -p logs

COPY --from=build /app/target/*.jar app.jar

ENV PORT=3001
EXPOSE 3001

# Enable Java logging and application logs
ENTRYPOINT ["sh", "-c", "java -Dserver.port=${PORT} -Dlogging.file.path=/app/logs -jar app.jar"]
