import express from 'express';
// Importa as funções que exportamos acima
import * as questionsController from '../src/questions.js'; 

const router = express.Router();

// Rota: /api/questions/exams
router.get('/exams', questionsController.getExams);

// Rota: /api/questions/:year/list
router.get('/:year/list', questionsController.getQuestionsList);

// Rota: /api/questions/:year/:id
router.get('/:year/:id', questionsController.getQuestionDetails);

export default router;