import { BadRequestException, ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const frontendOrigins = process.env.FRONTEND_ORIGIN?.split(",").map((origin) => origin.trim()) ?? [
    "http://localhost:3000",
    "http://127.0.0.1:3000"
  ];

  app.enableCors({
    origin: frontendOrigins,
    credentials: true
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors) => {
        const messages = errors.flatMap((error) => Object.values(error.constraints ?? {}));
        return new BadRequestException({
          status: "VALIDATION_ERROR",
          message: "Invalid input.",
          errors: messages
        });
      }
    })
  );

  await app.listen(process.env.PORT ? Number(process.env.PORT) : 3001, "127.0.0.1");
}

bootstrap();
