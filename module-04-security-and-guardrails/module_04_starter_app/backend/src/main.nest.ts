import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./nest/app.module";
import { getRuntimeProfileConfig } from "./config/runtimeProfile";

async function bootstrap() {
  const config = getRuntimeProfileConfig();
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: ["http://localhost:5173"],
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  });
  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port);
  console.log(`Nest backend listening on http://localhost:${port}`);
  console.log(
    `Runtime profile=${config.profile} llmMode=${config.llmMode} model=${config.modelIdentifier} confidenceThreshold=${config.confidenceThreshold} featureDocumentExtractionEnabled=${String(config.featureDocumentExtractionEnabled)} debugLlmLogs=${String(config.debugLlmLogs)}`
  );
}

void bootstrap();
