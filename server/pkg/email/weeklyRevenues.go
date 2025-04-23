package pkg

import (
	"fmt"
	"net/smtp"
	"os"
	"time"
)

func SendMailRevenues(email, name, revenueChange string, weekTotal float32, newStaff, outStaff, order, using int) error {
	auth := getSMTPAuth()
	currentYear, currentWeek := time.Now().ISOWeek()

	msg := fmt.Sprintf(`From: %s
To: %s
Subject: Báo cáo doanh thu tuần
MIME-Version: 1.0
Content-Type: text/html; charset="UTF-8"

<html>
	<body style="font-family: Arial, sans-serif;">
		<p>Kính gửi <strong>%s</strong>,</p>
		<p>Dưới đây là báo cáo doanh thu của nhà hàng trong tuần %d năm %d:</p>

		<ul>
			<li><strong>Tổng doanh thu tuần:</strong> %.1f VND</li>
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
</html>`, os.Getenv("MAIL_USERNAME"), email, name, currentWeek, currentYear, weekTotal, revenueChange, newStaff, outStaff, order, using)

	err := smtp.SendMail(
		getSMTPAddr(),
		auth,
		os.Getenv("MAIL_USERNAME"),
		[]string{email},
		[]byte(msg),
	)
	return err
}
