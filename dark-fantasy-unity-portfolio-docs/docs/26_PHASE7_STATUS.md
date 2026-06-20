# 26 - Trạng thái Phase 7

Cập nhật lần cuối: 2026-06-11

## Đã hoàn thành

- Đã thêm hệ thống i18n/content gọn nhẹ trong `src/scripts/site-content.js`.
- Có từ điển tiếng Anh và tiếng Việt, fallback về tiếng Anh.
- Header có bộ chuyển ngôn ngữ lưu lựa chọn `en`/`vi`.
- Nội dung public đã dùng i18n keys: loading gate, navigation, hero, character sheet, bộ lọc project, WebGL, skills, library, contact, chatbot và WebGL modal.
- Dữ liệu runtime được tách khỏi logic chính: nhãn audio, dòng loading WebGL, metadata demo, repo settings và fallback repo.
- Chuỗi runtime dùng `t(key)` với fallback `en`.
- Đổi ngôn ngữ sẽ render lại card repo, status, nhãn audio/motion, placeholder, aria label, alt text và metadata trang; đồng thời gửi event `LANGUAGE_SWITCHED` best-effort.
- CSS header đã được chỉnh để nhãn tiếng Việt dài không làm vỡ audio console ở tablet/mobile.

## Việc còn lại

- Admin dashboard vẫn cần i18n hoàn chỉnh.
- Mô tả GitHub API là nội dung bên ngoài, hiển thị theo dữ liệu GitHub trả về.
- CMS/editor sâu hơn là phần việc tương lai.
- Cần kiểm tra trực quan toàn trình duyệt trước deploy để phát hiện lỗi xuống dòng.

## Ghi chú QA

- Dùng nút `EN` / `VI` ở header để đổi ngôn ngữ.
- Reload phải giữ ngôn ngữ qua `localStorage`.
- Thiếu key tiếng Việt thì hiển thị tiếng Anh thay vì vỡ layout.
