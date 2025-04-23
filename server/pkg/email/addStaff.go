package pkg

import (
	"fmt"
	"net/smtp"
	"os"
)

func SendMailStaff(email, name, password string) error {
	auth := getSMTPAuth()

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
</html>`, os.Getenv("MAIL_USERNAME"), email, name, email, password)

	err := smtp.SendMail(
		getSMTPAddr(),
		auth,
		os.Getenv("MAIL_USERNAME"),
		[]string{email},
		[]byte(msg),
	)
	return err
}
