const swaggerUi = require('swagger-ui-express');

const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'Data Integrasi API Documentation',
    version: '1.0.0',
    description:
      'Dokumentasi API untuk Modul Login & Access Management (RBAC) dengan dukungan Karyawan Jabatan Ganda (Multi-Role) dan Dynamic Hierarchical Menu.',
    contact: {
      name: 'Development Team',
    },
  },
  servers: [
    {
      url: 'http://localhost:5000/api',
      description: 'Development Server',
    },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Masukkan JWT Token yang didapatkan dari login / select-role / switch-role',
      },
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          username: { type: 'string', example: 'admin' },
          full_name: { type: 'string', example: 'Administrator Utama' },
        },
      },
      Role: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          role_name: { type: 'string', example: 'Super Admin' },
          description: { type: 'string', example: 'Akses penuh ke semua fitur' },
        },
      },
      MenuItem: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          menu_name: { type: 'string', example: 'Master Data' },
          url: { type: 'string', example: '/master-data' },
          parent_id: { type: 'integer', nullable: true, example: null },
          order_index: { type: 'integer', example: 1 },
          icon: { type: 'string', example: 'database' },
          children: {
            type: 'array',
            items: { $ref: '#/components/schemas/MenuItem' },
          },
        },
      },
    },
  },
  paths: {
    '/auth/login': {
      post: {
        tags: ['Autentikasi'],
        summary: 'Login Karyawan',
        description:
          'Autentikasi username & password. Jika user memiliki multi-role, require_role_selection bernilai true dan mengembalikan temp_token.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['username', 'password'],
                properties: {
                  username: { type: 'string', example: 'admin' },
                  password: { type: 'string', example: 'password123' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Berhasil login atau butuh pemilihan role',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    require_role_selection: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'User has multiple roles' },
                    temp_token: { type: 'string', example: 'eyJhbGciOiJIUzI1Ni...' },
                    user: { $ref: '#/components/schemas/User' },
                    roles: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Role' },
                    },
                  },
                },
              },
            },
          },
          401: { description: 'Username atau password salah' },
        },
      },
    },
    '/auth/select-role': {
      post: {
        tags: ['Autentikasi'],
        summary: 'Pemilihan Role Aktif (Multi-Role)',
        description: 'Dipilih oleh karyawan setelah login untuk menentukan role aktif pada sesi ini.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['userId', 'roleId'],
                properties: {
                  userId: { type: 'integer', example: 1 },
                  roleId: { type: 'integer', example: 1 },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Role aktif berhasil dipilih dan menghasilkan JWT Token utama',
          },
        },
      },
    },
    '/auth/switch-role': {
      post: {
        tags: ['Autentikasi'],
        summary: 'Beralih Role (Switch Role)',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['roleId'],
                properties: {
                  roleId: { type: 'integer', example: 2 },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Berhasil beralih role aktif' },
        },
      },
    },
    '/auth/me': {
      get: {
        tags: ['Autentikasi'],
        summary: 'Informasi User & Role Aktif Sesi Ini',
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: 'Detail user dan active role saat ini' },
        },
      },
    },
    '/menus/my-menus': {
      get: {
        tags: ['Dynamic Menu'],
        summary: 'Ambil Menu Sesuai Role Aktif (Tree Hierarkis)',
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: 'Pohon menu hierarkis (recursive tree)' },
        },
      },
    },
    '/menus': {
      get: {
        tags: ['Dynamic Menu'],
        summary: 'Ambil Semua Menu',
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: 'Daftar semua menu' } },
      },
      post: {
        tags: ['Dynamic Menu'],
        summary: 'Buat Menu Baru',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['menu_name'],
                properties: {
                  menu_name: { type: 'string', example: 'Menu 1.4' },
                  url: { type: 'string', example: '/menu-1/4' },
                  parent_id: { type: 'integer', example: 100 },
                  order_index: { type: 'integer', example: 4 },
                  icon: { type: 'string', example: 'file-text' },
                },
              },
            },
          },
        },
        responses: { 201: { description: 'Menu berhasil dibuat' } },
      },
    },
    '/roles': {
      get: {
        tags: ['Role Management'],
        summary: 'Ambil Semua Role',
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: 'Daftar role' } },
      },
    },
    '/roles/{id}/menus': {
      get: {
        tags: ['Role Management'],
        summary: 'Ambil Menu Diizinkan untuk Role',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } },
        ],
        responses: { 200: { description: 'Daftar menu ID yang diizinkan' } },
      },
      put: {
        tags: ['Role Management'],
        summary: 'Simpan Hak Akses Menu ke Role',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  menuIds: {
                    type: 'array',
                    items: { type: 'integer' },
                    example: [1, 100, 110, 120],
                  },
                },
              },
            },
          },
        },
        responses: { 200: { description: 'Hak akses menu berhasil disimpan' } },
      },
    },
    '/users': {
      get: {
        tags: ['User Management'],
        summary: 'Ambil Semua User',
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: 'Daftar user beserta jabatannya' } },
      },
      post: {
        tags: ['User Management'],
        summary: 'Tambah User Baru',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['username', 'password', 'full_name'],
                properties: {
                  username: { type: 'string', example: 'karyawan_baru' },
                  password: { type: 'string', example: 'password123' },
                  full_name: { type: 'string', example: 'Ahmad Fauzi' },
                  role_ids: {
                    type: 'array',
                    items: { type: 'integer' },
                    example: [2, 3],
                  },
                },
              },
            },
          },
        },
        responses: { 201: { description: 'User baru berhasil dibuat' } },
      },
    },
    '/users/{id}/roles': {
      put: {
        tags: ['User Management'],
        summary: 'Atur Multi-Role Karyawan',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  role_ids: {
                    type: 'array',
                    items: { type: 'integer' },
                    example: [1, 2],
                  },
                },
              },
            },
          },
        },
        responses: { 200: { description: 'Role user berhasil diperbarui' } },
      },
    },
  },
};

const setupSwagger = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  console.log('📄 Swagger UI Documentation available at http://localhost:5000/api-docs');
};

module.exports = setupSwagger;
