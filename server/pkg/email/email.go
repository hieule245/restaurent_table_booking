package pkg

import (
	"fmt"
	"math/rand"
	"net/smtp"
	"time"
)

func SendMailSimple(email string, pin int) {
	auth := smtp.PlainAuth(
		"",
		"golangtraining2025@gmail.com",
		"vowhfgfectpvypos",
		"smtp.gmail.com",
	)

	msg := fmt.Sprintf(`From: golangtraining2025@gmail.com
To: %s
Subject: Mã PIN xác nhận đặt lại mật khẩu
MIME-Version: 1.0
Content-Type: text/html; charset="UTF-8"

<html>
	<body style="font-family: Arial, sans-serif; line-height: 1.6;">
		<p>Kính gửi <strong>%s</strong>,</p>
		<p>Mã PIN xác nhận của bạn là:</p>
		<p style="font-size: 20px; font-weight: bold; color: #ff0000;">%d</p>
		<p>Mã PIN này sẽ hết hạn sau <strong>5 phút</strong>. Vui lòng không chia sẻ mã PIN này với bất kỳ ai.</p>
		<p>Trân trọng</p>
	</body>
</html>`, email, email, pin)

	err := smtp.SendMail(
		"smtp.gmail.com:587",
		auth,
		"golangtraining2025@gmail.com",
		[]string{email},
		[]byte(msg),
	)

	if err != nil {
		fmt.Println(err)
	}
}

func RandomPin() int {
	rand.Seed(time.Now().UnixNano())
	return rand.Intn(900000) + 100000
}
