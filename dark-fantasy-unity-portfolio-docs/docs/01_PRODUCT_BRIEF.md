# 01 — Product Brief

## 1. Tên sản phẩm

**The Cursed Biomes Portfolio**  
Một dynamic portfolio website cho Unity Developer, lấy cảm hứng từ dark fantasy, cursed forest, biome transformation, ritual UI và demo game WebGL.

## 2. Elevator Pitch

> “Một portfolio không đứng yên như CV, mà hoạt động như một cổng game dark fantasy: repo tự cập nhật, demo Unity chạy trực tiếp, chatbot thu lead, admin ẩn quản lý log, và toàn bộ trải nghiệm được thiết kế như người xem đang bước vào thế giới Biomes.”

## 3. Đối tượng xem

| Persona | Họ muốn thấy gì | Website cần làm gì |
|---|---|---|
| HR / Recruiter | Nhanh hiểu bạn làm Unity, có CV, có contact | CTA rõ, CV download, Zalo, featured projects |
| Tech Lead | Code clean, architecture, demo thật | Repo realtime, docs, pipeline, Try Now WebGL |
| Game Studio | Taste UI, game feel, animation | Dark theme, motion mượt, Unity demo, visual polish |
| Bạn/Admin | Theo dõi visitor, tin nhắn, repo nào được hiện | Admin dashboard, filter log, repo toggle |

## 4. Core Experience

Visitor vào web sẽ trải qua flow:

```txt
Loading Horror Gate
  -> Hero Dark Fantasy
  -> Featured Unity/WebGL Demo
  -> Dynamic GitHub Projects
  -> Skills / Timeline / Books / Quotes
  -> Chatbot Contact
  -> CV + Zalo CTA
```

Admin flow:

```txt
Visitor gõ lệnh bí mật trong chatbot
  -> Backend kiểm tra admin gate phrase
  -> Nếu đúng: trả về admin login link one-time/session
  -> Admin login
  -> Dashboard: logs, messages, repo visibility, content settings
```

## 5. Unique Selling Points

1. **Portfolio như game menu**: loading, ambient audio, hover 3D, cursed cards.
2. **Repo realtime**: không phải sửa tay mỗi lần update GitHub.
3. **Try Now**: demo Unity WebGL ngay trên web.
4. **Hidden admin**: không phá trải nghiệm recruiter, nhưng bạn vẫn có dashboard.
5. **Visitor intelligence**: lưu log, lọc/sắp xếp để biết ai quan tâm.
6. **i18n chuẩn**: Anh/Việt không vỡ layout, không lỗi key.
7. **Content expandable**: thêm quote, sách, project phase, CV dễ dàng.

## 6. Scope phiên bản đầu

### Must-have

- Landing page dark fantasy.
- Dynamic project cards từ GitHub API.
- Repo visibility toggle lưu DB.
- Unity WebGL demo section có Try Now.
- Chatbot mini lưu message.
- Hidden admin command server-side.
- Visitor logs: timestamp, IP, user-agent, path, referrer, sessionId.
- i18n EN/VI.
- Audio loop 5 bài.
- Responsive mobile.

### Should-have

- 3D tilt card.
- Mouse ghost trail “time rewind”.
- Morph transition giữa sections.
- Export logs CSV.
- Admin filter theo date, IP, path, country, repo click.

### Could-have

- Live notification Telegram/Zalo OA/email khi visitor gửi tin.
- WebGL analytics event: start game, exit game, fullscreen.
- A/B theme: Blood Moon, Abyss Forest, Ruined Cathedral.

## 7. Success Metrics

| Metric | Ý nghĩa | Target ban đầu |
|---|---|---|
| Time on site | Recruiter ở lại lâu không | > 90 giây |
| Try Now clicks | Demo game có hấp dẫn không | > 20% visitor |
| CV downloads | Có convert sang ứng tuyển không | > 10% visitor |
| Chat messages | Visitor có liên hệ không | > 3% visitor |
| Repo clicks | Project nào được quan tâm | Top 3 repo rõ ràng |
| Load performance | Web có mượt không | LCP < 3s, CLS thấp |

## 8. Non-goals

- Không biến portfolio thành mạng xã hội lớn.
- Không log dữ liệu nhạy cảm quá mức.
- Không lấy MAC address visitor vì web browser không cung cấp.
- Không để admin secret ở client.
- Không dùng nhạc/sách không có bản quyền.

