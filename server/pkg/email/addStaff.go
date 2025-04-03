package pkg

import (
	"fmt"
	"net/smtp"
)

func SendMailStaff(email, name, password string) error {
	auth := smtp.PlainAuth(
		"",
		"golangtraining2025@gmail.com",
		"vowhfgfectpvypos",
		"smtp.gmail.com",
	)

	msg := fmt.Sprintf(`From: no-reply@tablebooker.com  
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
		<p><strong>Đội ngũ hỗ trợ</strong></p>
	</body>
</html>`, email, name, email, password)

	err := smtp.SendMail(
		"smtp.gmail.com:587",
		auth,
		"golangtraining2025@gmail.com",
		[]string{email},
		[]byte(msg),
	)
	return err
}
