package pkg

import (
	"fmt"
	"net/smtp"
	"os"
)

func SendMailStaff(email, name, password string) error {
	mailUser := os.Getenv("MAIL_USERNAME")
	mailPass := os.Getenv("MAIL_PASSWORD")
	smtpHost := os.Getenv("MAIL_SMTP_HOST")
	smtpPort := os.Getenv("MAIL_SMTP_PORT")

	auth := smtp.PlainAuth("", mailUser, mailPass, smtpHost)

	msg := fmt.Sprintf(`From: %s
To: %s
Subject: Thông tin tài khoản nhân viên của bạn
MIME-Version: 1.0
Content-Type: text/html; charset="UTF-8"

<html>
	<body style="font-family: Arial, sans-serif;">
		<p>Kính gửi <strong>%s</strong>,</p>
		<p>Chúng tôi xin thông báo rằng tài khoản của bạn đã được tạo thành công trên hệ thống.</p>
		<p>Thông tin đăng nhập của bạn:</p>
		<ul>
			<li><strong>Email:</strong> %s</li>
			<li><strong>Mật khẩu:</strong> %s</li>
		</ul>
		<p>Vui lòng đăng nhập vào hệ thống và đổi mật khẩu ngay để bảo mật tài khoản.</p>
		<p>Trân trọng,</p>
		<p><strong>Đội ngũ hỗ trợ TableBooker</strong></p>
	</body>
</html>`, mailUser, email, name, email, password)

	err := smtp.SendMail(
		smtpHost+":"+smtpPort,
		auth,
		mailUser,
		[]string{email},
		[]byte(msg),
	)
	return err
}
