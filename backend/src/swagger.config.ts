import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';

export function buildSwaggerDocument(app: INestApplication): OpenAPIObject {
  const config = new DocumentBuilder()
    .setTitle('WCAG Auditor API')
    .setDescription('API pour auditer la conformité WCAG 2.1 AA des URLs publiques')
    .setVersion('0.1.0')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'opaque',
      description:
        'Jeton partagé MUTATION_API_TOKEN, exigé pour les routes POST/PUT/PATCH/DELETE. Les routes GET restent publiques.',
    })
    .build();
  return SwaggerModule.createDocument(app, config);
}
