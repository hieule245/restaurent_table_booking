package pkg

import (
	"fmt"
	"net/smtp"
	"time"
)

func SendMailRevenues(email, name, revenueChange string, weekTotal float32, newStaff, outStaff, order, using int) error {
	auth := smtp.PlainAuth(
		"",
		"golangtraining2025@gmail.com",
		"vowhfgfectpvypos",
		"smtp.gmail.com",
	)

	currentYear, currentWeek := time.Now().ISOWeek()

	msg := fmt.Sprintf(`From: golangtraining2025@gmail.com
To: %s
Subject: Báo cáo doanh thu tuần
MIME-Version: 1.0
Content-Type: text/html; charset="UTF-8"

<html>
	<body style="font-family: Arial, sans-serif;">
		<p>Kính gửi <strong>%s</strong>,</p>
		<p>Dưới đây là báo cáo doanh thu của nhà hàng trong tuần %d năm %d:</p>

		<ul>
			<li><strong>Tổng doanh thu tuần:</strong> %.1fVND</li>
			<li><strong>Chênh lệch so với tháng trước:</strong> %s</li>
			<li><strong>Số lượng nhân viên mới:</strong> %d</li>
			<li><strong>Số lượng nhân viên xin nghỉ:</strong> %d</li>
			<li><strong>Số lượng khách sử dụng web đặt bàn:</strong> %d</li>
			<li><strong>Tổng số lượng khách tới quán:</strong> %d</li>
		</ul>

		<p>Nếu có bất kỳ câu hỏi hoặc cần thêm thông tin chi tiết, vui lòng liên hệ với chúng tôi.</p>
		<p>Trân trọng,</p>
		<p><strong>TableBooker</strong></p>
	</body>
</html>`, email, name, currentWeek, currentYear, weekTotal, revenueChange, newStaff, outStaff, order, using)

	err := smtp.SendMail(
		"smtp.gmail.com:587",
		auth,
		"golangtraining2025@gmail.com",
		[]string{email},
		[]byte(msg),
	)
	return err
}
