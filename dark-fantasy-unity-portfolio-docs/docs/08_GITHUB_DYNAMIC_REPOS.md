# 08 — GitHub Dynamic Repositories

## 1. Mục tiêu

Tự động cập nhật repo GitHub của `PiupiuTenshi` theo thời gian thật, nhưng vẫn cho admin quyết định repo nào được hiện/tắt.

## 2. Public GitHub source

GitHub username:

```txt
PiupiuTenshi
```

Public profile currently shows direction around Unity, C#, gameplay systems, backend, automation and listed public repositories such as:

- `Privacy-Preserving-Vertical-Fragmentation-PII-Shield`
- `TechWeb-2026`
- `Academic-performance-management`
- `BotAI`
- `GameProgramBooks`
- `Unity2DTopDown`
- `Astar`
- `Coordinator-Assistant`

## 3. API strategy

### Endpoint

```txt
GET https://api.github.com/users/PiupiuTenshi/repos?sort=updated&direction=desc&per_page=100
```

### Backend proxy

Không gọi trực tiếp từ frontend nếu muốn cache và tránh rate limit:

```txt
GET /api/github/repos
```

Backend sẽ:

1. Check cache.
2. Gọi GitHub API nếu cache hết hạn.
3. Normalize repo.
4. Merge với bảng `repo_settings`.
5. Trả repo public visible.

## 4. Normalized repo model

```ts
type NormalizedRepo = {
  githubId: number;
  name: string;
  fullName: string;
  description: string | null;
  htmlUrl: string;
  homepage: string | null;
  language: string | null;
  topics: string[];
  stars: number;
  forks: number;
  openIssues: number;
  pushedAt: string;
  updatedAt: string;
  archived: boolean;
  fork: boolean;
};
```

## 5. Admin overlay settings

```ts
type RepoSetting = {
  githubId: number;
  visible: boolean;
  featured: boolean;
  priority: number;
  category: "unity" | "backend" | "ai" | "web" | "algorithm" | "database" | "other";
  tryNowUrl?: string;
  caseStudyUrl?: string;
  customTitle?: string;
  customDescription?: string;
};
```

## 6. Merge logic

```txt
For each GitHub repo:
  setting = repo_settings.find(githubId)
  if no setting:
    create default setting visible=true featured=false priority=999
  displayRepo = GitHub data + admin setting
  if visible=false:
    hide from public
```

## 7. Featured project rules

Nên ưu tiên:

1. Unity/game repo.
2. Repo có demo WebGL/TryNow.
3. Repo có README tốt.
4. Repo có screenshot/gif.
5. Repo có commit gần đây.
6. Repo thể hiện kỹ năng tuyển dụng cần.

Gợi ý featured ban đầu:

```txt
Unity2DTopDown
BotAI
Privacy-Preserving-Vertical-Fragmentation-PII-Shield
Astar
TechWeb-2026
Academic-performance-management
```

## 8. Fallback data

Nếu GitHub API lỗi, frontend vẫn có fallback:

```json
[
  {
    "name": "Unity2DTopDown",
    "description": "Unity 2D top-down project for gameplay programming showcase.",
    "language": "ShaderLab / C#",
    "htmlUrl": "https://github.com/PiupiuTenshi/Unity2DTopDown",
    "featured": true
  }
]
```

## 9. Cache policy

| Data | TTL |
|---|---:|
| Public repos | 5–15 phút |
| Repo settings | Realtime DB query hoặc 60 giây |
| GitHub language/topics | 15 phút |
| Admin dashboard | No cache / short cache |

## 10. UI sorting

Public sorting:

```txt
featured desc
priority asc
pushedAt desc
stars desc
name asc
```

Admin sorting:

```txt
updatedAt desc
visible desc
featured desc
category asc
```

## 11. Event tracking

Track:

```txt
PROJECT_VIEW
PROJECT_CLICK_CODE
PROJECT_CLICK_TRY_NOW
PROJECT_CLICK_DOCS
PROJECT_FILTER_CHANGE
```

Payload:

```json
{
  "repoName": "Unity2DTopDown",
  "repoLanguage": "ShaderLab",
  "action": "try_now"
}
```

