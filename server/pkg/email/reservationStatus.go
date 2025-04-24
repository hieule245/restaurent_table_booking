package pkg

import (
	"encoding/base64"
	"fmt"
	"net/smtp"
	"os"
	"time"
)

func ConfirmReservation(email, name, restaurant_name, bookdate string, numberCustomer int) error {
	auth := getSMTPAuth()
	parsedDate, err := time.Parse(time.RFC3339, bookdate)
	if err != nil {
		return err
	}
	day := parsedDate.Format("02/01/2006")

	from := os.Getenv("MAIL_USERNAME")
	subject := "=?UTF-8?B?" + base64.StdEncoding.EncodeToString([]byte("Xác nhận đặt bàn thành công")) + "?="

	body := fmt.Sprintf(`
<html>
  <body style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
    <div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
      <p>Kính gửi <strong>%s</strong>,</p>
      <p>Chúng tôi rất vui thông báo rằng đơn đặt bàn của quý khách đã được xác nhận thành công.</p>
      <p>Thông tin chi tiết:</p>
      <ul>
        <li><strong>Nhà hàng:</strong> %s</li>
        <li><strong>Ngày:</strong> %s</li>
        <li><strong>Số người:</strong> %d</li>
      </ul>
      <p>Rất mong quý khách có mặt tại nhà hàng đúng giờ để được phục vụ tốt nhất.</p>
      <p>Nếu quý khách cần thay đổi hoặc hủy đặt bàn, vui lòng liên hệ với chúng tôi sớm nhất có thể.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="https://giolang.cloud.runsystem.site" style="background: linear-gradient(to right, #e52d27, #b31217); color: #fff; padding: 15px 30px; font-size: 16px; text-decoration: none; border-radius: 50px; font-weight: bold; display: inline-block; box-shadow: 0 4px 6px rgba(0,0,0,0.1); transition: background 0.3s ease;">
          Truy cập Website TableBooker
        </a>
      </div>
      <p style="margin-top: 40px;">Trân trọng,</p>
      <p><strong>Đội ngũ hỗ trợ TableBooker</strong></p>
    </div>
  </body>
</html>`, name, restaurant_name, day, numberCustomer)

	message := fmt.Sprintf("From: %s\r\nTo: %s\r\nSubject: %s\r\nMIME-Version: 1.0\r\nContent-Type: text/html; charset=\"UTF-8\"\r\n\r\n%s",
		from, email, subject, body)

	err = smtp.SendMail(
		getSMTPAddr(),
		auth,
		from,
		[]string{email},
		[]byte(message),
	)
	return err
}

func CancelReservation(email, name, restaurant_name, bookdate string, numberCustomer int) error {
	auth := getSMTPAuth()
	parsedDate, err := time.Parse(time.RFC3339, bookdate)
	if err != nil {
		return err
	}
	day := parsedDate.Format("02/01/2006")
	from := os.Getenv("MAIL_USERNAME")

	// Encode subject để tránh lỗi tiếng Việt
	subject := "=?UTF-8?B?" + base64.StdEncoding.EncodeToString([]byte("Thông báo hủy đặt bàn")) + "?="

	body := fmt.Sprintf(`
<html>
  <body style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
    <div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
      <p>Kính gửi <strong>%s</strong>,</p>
      <p>Chúng tôi xin lỗi vì phải thông báo rằng đơn đặt bàn của quý khách <strong>không thành công</strong> do một số lý do ngoài ý muốn.</p>
      <p>Thông tin chi tiết:</p>
      <ul>
        <li><strong>Nhà hàng:</strong> %s</li>
        <li><strong>Ngày:</strong> %s</li>
        <li><strong>Số người:</strong> %d</li>
      </ul>
      <p>Rất mong quý khách thử đặt lại vào khung giờ khác để chúng tôi có cơ hội phục vụ tốt hơn.</p>
      <p>Chúng tôi xin lỗi vì sự bất tiện này và hy vọng sớm được đón tiếp quý khách.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="https://giolang.cloud.runsystem.site" style="background: linear-gradient(to right, #e52d27, #b31217); color: #fff; padding: 15px 30px; font-size: 16px; text-decoration: none; border-radius: 50px; font-weight: bold; display: inline-block; box-shadow: 0 4px 6px rgba(0,0,0,0.1); transition: background 0.3s ease;">
          Truy cập Website TableBooker
        </a>
      </div>
      <p style="margin-top: 40px;">Trân trọng,</p>
      <p><strong>Đội ngũ hỗ trợ TableBooker</strong></p>
    </div>
  </body>
</html>
`, name, restaurant_name, day, numberCustomer)

	message := fmt.Sprintf("From: %s\r\nTo: %s\r\nSubject: %s\r\nMIME-Version: 1.0\r\nContent-Type: text/html; charset=\"UTF-8\"\r\n\r\n%s",
		from, email, subject, body)

	err = smtp.SendMail(
		getSMTPAddr(),
		auth,
		from,
		[]string{email},
		[]byte(message),
	)
	return err
}
