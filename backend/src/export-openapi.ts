import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { NestFactory } from '@nestjs/core';
import { dump } from 'js-yaml';
import { AppModule } from './app.module';
import { buildSwaggerDocument } from './swagger.config';

async function main(): Promise<void> {
  const app = await NestFactory.create(AppModule, { logger: false });
  const document = buildSwaggerDocument(app);
  const outputPath = join(__dirname, '../../docs/openapi.yaml');
  writeFileSync(outputPath, dump(document, { noRefs: true }));
  console.log(`OpenAPI spec written to ${outputPath}`);
  await app.close();
}

void main();
