import { difficultyEnum, roleEnum, viewTypeEnum } from '../../zod-schemas.ts';

// Basic reusable enum schemas
const enums = {
    Difficulty: {
        type: 'string',
        enum: difficultyEnum.enum
    },
    ViewType: {
        type: 'string',
        enum: viewTypeEnum.enum
    },
    Role: {
        type: 'string',
        enum: roleEnum.enum
    }
};

const components = {
    securitySchemes: {
        bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT'
        }
    },
    schemas: {
        User: {
            type: 'object',
            properties: {
                id: { type: 'integer' },
                username: { type: 'string' },
                firstName: { type: 'string' },
                lastName: { type: 'string' },
                email: { type: 'string' },
                birthday: { type: 'string', format: 'date' },
                role: enums.Role
            }
        },
        Quiz: {
            type: 'object',
            properties: {
                id: { type: 'integer' },
                title: { type: 'string' },
                description: { type: 'string' },
                difficulty: enums.Difficulty,
                subject: { type: 'string' },
                viewType: enums.ViewType,
                authorId: { type: 'integer' },
                createdAt: { type: 'string', format: 'date-time' }
            }
        },
        Question: {
            type: 'object',
            properties: {
                id: { type: 'integer' },
                quizId: { type: 'integer' },
                title: { type: 'string' },
                data: { type: 'object' }
            }
        },
        Comment: {
            type: 'object',
            properties: {
                id: { type: 'integer' },
                quizId: { type: 'integer' },
                userId: { type: 'integer' },
                text: { type: 'string' },
                createdAt: { type: 'string', format: 'date-time' }
            }
        },
        Attempt: {
            type: 'object',
            properties: {
                id: { type: 'integer' },
                userId: { type: 'integer' },
                quizId: { type: 'integer' },
                assignmentId: { type: 'integer', nullable: true },
                startedAt: { type: 'string', format: 'date-time' },
                finishedAt: { type: 'string', format: 'date-time' },
                score: { type: 'integer' }
            }
        },
        Class: {
            type: 'object',
            properties: {
                id: { type: 'integer' },
                name: { type: 'string' },
                authorId: { type: 'integer' }
            }
        },
        Assignment: {
            type: 'object',
            properties: {
                id: { type: 'integer' },
                classId: { type: 'integer' },
                authorId: { type: 'integer' },
                title: { type: 'string' },
                description: { type: 'string' },
                dueBy: { type: 'string', format: 'date-time' },
                createdAt: { type: 'string', format: 'date-time' }
            }
        }
    }
};

const paths = {
    '/api/auth/login': {
        post: {
            summary: 'Login',
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                email: { type: 'string' },
                                password: { type: 'string' }
                            },
                            required: ['email', 'password']
                        }
                    }
                }
            },
            responses: {
                200: {
                    description: 'JWT token',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    token: { type: 'string' }
                                }
                            }
                        }
                    }
                }
            }
        }
    },
    '/api/auth/register': {
        post: {
            summary: 'Register user',
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                username: { type: 'string' },
                                firstName: { type: 'string' },
                                lastName: { type: 'string' },
                                email: { type: 'string' },
                                birthday: { type: 'string', format: 'date' },
                                password: { type: 'string' }
                            },
                            required: [
                                'username',
                                'firstName',
                                'lastName',
                                'email',
                                'birthday',
                                'password'
                            ]
                        }
                    }
                }
            },
            responses: { 200: { description: 'User created' } }
        }
    },
    '/api/quizzes': {
        get: {
            summary: 'List quizzes',
            security: [{ bearerAuth: [] }],
            parameters: [
                { in: 'query', name: 'page', schema: { type: 'integer', default: 1 } },
                { in: 'query', name: 'pageSize', schema: { type: 'integer', default: 20 } },
                { in: 'query', name: 'subject', schema: { type: 'string' } },
                { in: 'query', name: 'difficulty', schema: enums.Difficulty },
                { in: 'query', name: 'viewType', schema: enums.ViewType }
            ],
            responses: {
                200: {
                    description: 'Paged quizzes',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    data: { type: 'array', items: { $ref: '#/components/schemas/Quiz' } },
                                    page: { type: 'integer' },
                                    pageSize: { type: 'integer' }
                                }
                            }
                        }
                    }
                }
            }
        },
        post: {
            summary: 'Create quiz with questions',
            security: [{ bearerAuth: [] }],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                title: { type: 'string' },
                                description: { type: 'string' },
                                difficulty: enums.Difficulty,
                                subject: { type: 'string' },
                                viewType: enums.ViewType,
                                questions: {
                                    type: 'array',
                                    items: { $ref: '#/components/schemas/Question' }
                                }
                            },
                            required: [
                                'title',
                                'description',
                                'difficulty',
                                'subject',
                                'viewType',
                                'questions'
                            ]
                        }
                    }
                }
            },
            responses: { 201: { description: 'Created quiz' } }
        }
    },
    '/api/quizzes/{id}': {
        get: {
            summary: 'Get quiz by id with questions',
            security: [{ bearerAuth: [] }],
            parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
            responses: { 200: { description: 'Quiz', content: { 'application/json': {} } } }
        },
        patch: {
            summary: 'Update quiz',
            security: [{ bearerAuth: [] }],
            parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
            requestBody: { content: { 'application/json': { schema: { type: 'object' } } } },
            responses: { 200: { description: 'Updated' } }
        },
        delete: {
            summary: 'Delete quiz (hard)',
            security: [{ bearerAuth: [] }],
            parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
            responses: { 200: { description: 'Deleted' } }
        }
    },
    '/api/questions/{id}': {
        get: {
            summary: 'Get question',
            security: [{ bearerAuth: [] }],
            parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
            responses: { 200: { description: 'Question' } }
        },
        patch: {
            summary: 'Update question',
            security: [{ bearerAuth: [] }],
            parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
            requestBody: { content: { 'application/json': { schema: { type: 'object' } } } },
            responses: { 200: { description: 'Updated' } }
        },
        delete: {
            summary: 'Delete question',
            security: [{ bearerAuth: [] }],
            parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
            responses: { 200: { description: 'Deleted' } }
        }
    },
    '/api/questions/quiz/{quizId}': {
        get: {
            summary: 'List questions for a quiz',
            security: [{ bearerAuth: [] }],
            parameters: [{ in: 'path', name: 'quizId', required: true, schema: { type: 'integer' } }],
            responses: { 200: { description: 'List' } }
        },
        post: {
            summary: 'Add question to quiz',
            security: [{ bearerAuth: [] }],
            parameters: [{ in: 'path', name: 'quizId', required: true, schema: { type: 'integer' } }],
            requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/Question' } } } },
            responses: { 201: { description: 'Created' } }
        }
    },
    '/api/quizzes/{id}/comments': {
        get: {
            summary: 'List comments for quiz',
            security: [{ bearerAuth: [] }],
            parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
            responses: { 200: { description: 'Comments' } }
        },
        post: {
            summary: 'Add comment to quiz',
            security: [{ bearerAuth: [] }],
            parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
            requestBody: {
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: { text: { type: 'string' } },
                            required: ['text']
                        }
                    }
                }
            },
            responses: { 201: { description: 'Created' } }
        }
    },
    '/api/attempts': {
        get: {
            summary: 'List attempts for current user',
            security: [{ bearerAuth: [] }],
            parameters: [
                { in: 'query', name: 'page', schema: { type: 'integer', default: 1 } },
                { in: 'query', name: 'pageSize', schema: { type: 'integer', default: 20 } },
                { in: 'query', name: 'quizId', schema: { type: 'integer' } }
            ],
            responses: { 200: { description: 'List' } }
        }
    },
    '/api/quizzes/{quizId}/attempts': {
        post: {
            summary: 'Create attempt for quiz',
            security: [{ bearerAuth: [] }],
            parameters: [{ in: 'path', name: 'quizId', required: true, schema: { type: 'integer' } }],
            requestBody: {
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                assignmentId: { type: 'integer', nullable: true },
                                startedAt: { type: 'string', format: 'date-time', nullable: true }
                            }
                        }
                    }
                }
            },
            responses: { 201: { description: 'Created' } }
        }
    },
    '/api/classes': {
        get: {
            summary: 'List classes',
            security: [{ bearerAuth: [] }],
            responses: { 200: { description: 'List' } }
        },
        post: {
            summary: 'Create class',
            security: [{ bearerAuth: [] }],
            requestBody: {
                content: {
                    'application/json': {
                        schema: { type: 'object', properties: { name: { type: 'string' } }, required: ['name'] }
                    }
                }
            },
            responses: { 201: { description: 'Created' } }
        }
    },
    '/api/classes/{id}/assignments': {
        post: {
            summary: 'Create assignment for class',
            security: [{ bearerAuth: [] }],
            parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
            requestBody: {
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                title: { type: 'string' },
                                dueBy: { type: 'string', format: 'date-time' },
                                description: { type: 'string' },
                                quizIds: { type: 'array', items: { type: 'integer' } }
                            },
                            required: ['title', 'dueBy', 'description']
                        }
                    }
                }
            },
            responses: { 201: { description: 'Created' } }
        },
        get: {
            summary: 'List assignments in class',
            security: [{ bearerAuth: [] }],
            parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
            responses: { 200: { description: 'List' } }
        }
    },
    '/api/admin/users': {
        get: {
            summary: 'Admin list users',
            security: [{ bearerAuth: [] }],
            responses: { 200: { description: 'List' } }
        },
        post: {
            summary: 'Admin create user',
            security: [{ bearerAuth: [] }],
            requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } } },
            responses: { 201: { description: 'Created' } }
        }
    },
    '/api/admin/users/{id}/role': {
        post: {
            summary: 'Set role',
            security: [{ bearerAuth: [] }],
            parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
            requestBody: {
                content: {
                    'application/json': {
                        schema: { type: 'object', properties: { role: enums.Role }, required: ['role'] }
                    }
                }
            },
            responses: { 200: { description: 'Updated' } }
        }
    }
};

const swaggerSpec = {
    openapi: '3.0.3',
    info: {
        title: 'ExamHop API',
        version: '1.0.0'
    },
    servers: [{ url: 'http://localhost:8000' }],
    components,
    paths
};

export default swaggerSpec;

