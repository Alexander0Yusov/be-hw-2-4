import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Blogs API',
      version: '1.0.0',
      description: 'blogs API',
    },
  },
  apis: ['./src/**/*.swagger.yml'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

export const setupSwagger = (app: Express) => {
  app.use('/api', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};
