# Todo App — AWS Full-Stack

Ứng dụng Todo full-stack chạy trên AWS serverless, viết bằng TypeScript xuyên suốt (frontend → backend → hạ tầng).

## Tech stack

| Lớp | Công nghệ |
|---|---|
| Frontend | React + TypeScript (Vite), Tailwind CSS, TanStack Query |
| Backend | Node.js 20 + TypeScript (Lambda), Zod (validation) |
| Database | DynamoDB (SDK v3, DocumentClient) |
| Auth | Cognito User Pool (Hosted UI + JWT) |
| API | **API Gateway HTTP API** + JWT authorizer |
| Hạ tầng (IaC) | AWS CDK (TypeScript) |
| Hosting FE | S3 + CloudFront |
| CI/CD | GitHub Actions (OIDC) |
| Test | Vitest |

## Cấu trúc thư mục (monorepo)

```
todo-app/
├── backend/      # Lambda handlers (TypeScript) + repository + dev server local
├── infra/        # AWS CDK — định nghĩa toàn bộ hạ tầng bằng code
├── frontend/     # React + Vite app
└── README.md
```

Mỗi thư mục `backend/`, `infra/`, `frontend/` là một package Node độc lập (có `package.json` riêng).

## Trạng thái

🚧 Đang build lại từ đầu — xem tiến độ ở phần dưới khi cập nhật.
