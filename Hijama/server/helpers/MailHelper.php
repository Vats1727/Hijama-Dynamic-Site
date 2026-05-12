<?php

class MailHelper {
    private static $smtp_host = 'smtp.gmail.com';
    private static $smtp_port = 587;
    private static $smtp_user = 'allygithub@gmail.com';
    private static $smtp_pass = 'nzil wikd xxbs amkt';
    private static $from_name = 'Allysoft Solution';

    public static function sendOtp($to, $otp) {
        $subject = "Your Verification Code: $otp";
        $message = "
            <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;'>
                <h2 style='color: #6366f1;'>Password Recovery</h2>
                <p>Hello,</p>
                <p>You requested a password reset. Use the following 4-digit code to verify your identity:</p>
                <div style='background: #f8fafc; padding: 20px; text-align: center; font-size: 32px; font-weight: 800; letter-spacing: 10px; color: #1e293b; border-radius: 8px; margin: 20px 0;'>
                    $otp
                </div>
                <p style='color: #64748b; font-size: 14px;'>This code will expire in 15 minutes. If you did not request this, please ignore this email.</p>
                <hr style='border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;'>
                <p style='color: #94a3b8; font-size: 12px; text-align: center;'>&copy; " . date('Y') . " Allysoft Solution. All rights reserved.</p>
            </div>
        ";

        return self::sendSmtp($to, $subject, $message);
    }

    public static function sendThankYouEmail($to, $name) {
        $subject = "Thank you for booking an appointment!";
        $message = "
            <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;'>
                <h2 style='color: #6366f1;'>Appointment Booked Successfully!</h2>
                <p>Hello <strong>$name</strong>,</p>
                <p>Thank you for requesting an appointment at our clinic. We have successfully received your details.</p>
                <p>Our team will review your request and get back to you shortly to confirm the appointment.</p>
                <div style='background: #f8fafc; padding: 16px; border-left: 4px solid #6366f1; font-size: 14px; color: #1e293b; border-radius: 4px; margin: 20px 0;'>
                    <strong>What's next?</strong><br>
                    Keep an eye on your email or phone number. We will contact you directly to confirm the availability.
                </div>
                <hr style='border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;'>
                <p style='color: #94a3b8; font-size: 12px; text-align: center;'>&copy; " . date('Y') . " Al-Shifa Hijama & Cupping Therapy Clinic. All rights reserved.</p>
            </div>
        ";

        return self::sendSmtp($to, $subject, $message);
    }

    private static function sendSmtp($to, $subject, $message) {
        $timeout = 10;
        $socket = fsockopen(self::$smtp_host, self::$smtp_port, $errno, $errstr, $timeout);
        if (!$socket) throw new Exception("Could not connect to SMTP: $errstr ($errno)");

        self::getResponse($socket); // 220
        fwrite($socket, "EHLO localhost\r\n");
        self::getResponse($socket); // 250
        
        fwrite($socket, "STARTTLS\r\n");
        self::getResponse($socket); // 220
        
        if (!stream_socket_enable_crypto($socket, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)) {
            throw new Exception("TLS encryption failed");
        }
        
        fwrite($socket, "EHLO localhost\r\n");
        self::getResponse($socket); // 250
        
        fwrite($socket, "AUTH LOGIN\r\n");
        self::getResponse($socket); // 334
        
        fwrite($socket, base64_encode(self::$smtp_user) . "\r\n");
        self::getResponse($socket); // 334
        
        fwrite($socket, base64_encode(self::$smtp_pass) . "\r\n");
        self::getResponse($socket); // 235
        
        fwrite($socket, "MAIL FROM: <" . self::$smtp_user . ">\r\n");
        self::getResponse($socket); // 250
        
        fwrite($socket, "RCPT TO: <$to>\r\n");
        self::getResponse($socket); // 250
        
        fwrite($socket, "DATA\r\n");
        self::getResponse($socket); // 354
        
        $headers = "MIME-Version: 1.0\r\n";
        $headers .= "Content-type: text/html; charset=UTF-8\r\n";
        $headers .= "From: " . self::$from_name . " <" . self::$smtp_user . ">\r\n";
        $headers .= "To: <$to>\r\n";
        $headers .= "Subject: $subject\r\n";
        $headers .= "Date: " . date('r') . "\r\n";
        
        fwrite($socket, $headers . "\r\n" . $message . "\r\n.\r\n");
        self::getResponse($socket); // 250
        
        fwrite($socket, "QUIT\r\n");
        fclose($socket);
        return true;
    }

    private static function getResponse($socket) {
        $response = "";
        while ($line = fgets($socket, 515)) {
            $response .= $line;
            if (substr($line, 3, 1) == " ") break;
        }
        $code = (int)substr($response, 0, 3);
        if ($code >= 400) throw new Exception("SMTP Error: $response");
        return $response;
    }
}
