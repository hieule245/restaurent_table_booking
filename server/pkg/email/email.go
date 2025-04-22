package pkg

import (
	"fmt"
	"math/rand"
	"net/smtp"
	"os"
	"time"
)

func getSMTPAuth() smtp.Auth {
	return smtp.PlainAuth(
		"",
		os.Getenv("MAIL_USERNAME"),
		os.Getenv("MAIL_PASSWORD"),
		os.Getenv("MAIL_HOST"),
	)
}

func getSMTPAddr() string {
	return fmt.Sprintf("%s:%s", os.Getenv("MAIL_HOST"), os.Getenv("MAIL_PORT"))
}

func SendMailSimple(email string, pin int) {
	auth := getSMTPAuth()

	msg := fmt.Sprintf(`From: %s
To: %s
Subject: Mã PIN xác nhận đặt lại mật khẩu
MIME-Version: 1.0
Content-Type: text/html; charset="UTF-8"

<html>
	<body style="font-family: Arial, sans-serif;">
		<p>Kính gửi <strong>%s</strong>,</p>
		<p>Mã PIN xác nhận của bạn là:</p>
		<p style="font-size: 20px; font-weight: bold; color: #ff0000;">%d</p>
		<p>Mã PIN này sẽ hết hạn sau <strong>2 phút</strong>. Vui lòng không chia sẻ mã PIN này với bất kỳ ai.</p>
		<p>Trân trọng</p>
	</body>
</html>`,
		os.Getenv("MAIL_USERNAME"),
		email,
		email,
		pin,
	)

	err := smtp.SendMail(
		getSMTPAddr(),
		auth,
		os.Getenv("MAIL_USERNAME"),
		[]string{email},
		[]byte(msg),
	)

	if err != nil {
		fmt.Println("SendMailSimple error:", err)
	}
}

func SendMailWarning(email string) {
	auth := getSMTPAuth()

	msg := fmt.Sprintf(`From: %s
To: %s
Subject: Cảnh báo: Nhập mã PIN sai quá 5 lần
MIME-Version: 1.0
Content-Type: text/html; charset="UTF-8"

<html>
	<body style="font-family: Arial, sans-serif; ">
		<p>Kính gửi <strong>%s</strong>,</p>
		<p>Chúng tôi phát hiện tài khoản của bạn đã nhập mã PIN sai quá <strong>5 lần</strong>.</p>
		<p>Vui lòng kiểm tra xem bạn có thực hiện các lần nhập này không hoặc tài khoản của bạn có đang bị truy cập trái phép hay không.</p>
		<p style="font-size: 16px; font-weight: bold; color: #ff0000;">Reply mail này và liên hệ hoặc liên hệ với admin để có thể được cấp lại mail</p>
		<p>Nếu cần hỗ trợ, vui lòng truy cập <strong>web chúng tôi</strong>.</p>
	</body>
</html>`,
		os.Getenv("MAIL_USERNAME"),
		email,
		email,
	)

	err := smtp.SendMail(
		getSMTPAddr(),
		auth,
		os.Getenv("MAIL_USERNAME"),
		[]string{email},
		[]byte(msg),
	)

	if err != nil {
		fmt.Println("SendMailWarning error:", err)
	}
}

func RandomPin() int {
	rand.Seed(time.Now().UnixNano())
	return rand.Intn(900000) + 100000
}

func SendBookingConfirmation(email string, bookingDetails string) {
	auth := getSMTPAuth()

	msg := fmt.Sprintf(`From: %s
To: %s
Subject: Booking Confirmation
MIME-Version: 1.0
Content-Type: text/html; charset="UTF-8"

<html>
	<body style="font-family: Arial, sans-serif;">
		<p>Dear %s,</p>
		<p>Your booking has been confirmed with the following details:</p>
		%s
		<p>Thank you for choosing our service!</p>
	</body>
</html>`,
		os.Getenv("MAIL_USERNAME"),
		email,
		email,
		bookingDetails,
	)

	err := smtp.SendMail(
		getSMTPAddr(),
		auth,
		os.Getenv("MAIL_USERNAME"),
		[]string{email},
		[]byte(msg),
	)

	if err != nil {
		fmt.Println("SendBookingConfirmation error:", err)
	}
}
